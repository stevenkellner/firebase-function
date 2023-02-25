import * as functions from 'firebase-functions';
import { type AuthData, type FunctionsErrorCode } from 'firebase-functions/lib/common/providers/https';
import { Crypter } from './crypter/Crypter';
import { DatabaseType } from './DatabaseType';
import { HttpsError } from './HttpsError';
import { type ILogger, Logger, type VerboseType, DummyLogger } from './logger';
import { Result, type Result as ResultSuccessFailure } from './Result';
import { type ValidReturnType } from './ValidReturnType';

/**
 * Firebase function with parameters and a execute method to get the result.
 */
export interface FirebaseFunction<Parameters, ReturnType extends ValidReturnType> {
    /**
     * Parameters of the firebase function.
     */
    parameters: Parameters;

    /**
     * Executes the firebase function.
     * @returns Result of the firebase function.
     */
    executeFunction(): Promise<ReturnType>;
}

export namespace FirebaseFunction {
    /**
     * The parameters type of the firebase function
     */
    export type Parameters<T extends FirebaseFunction<unknown, ValidReturnType>> = T extends FirebaseFunction<infer Parameters, ValidReturnType> ? Parameters : never;

    /**
     * The return type of the firebase funtion.
     */
    export type ReturnType<T extends FirebaseFunction<unknown, ValidReturnType>> = T extends FirebaseFunction<unknown, infer ReturnType> ? ReturnType : never;

    /**
     * Error thrown by the firebase function.
     */
    export interface Error {
        name: 'FirebaseFunctionError';
        code: FunctionsErrorCode;
        message: string;
        details?: unknown;
        stack?: string;
    }

    /**
     * Result type of the firease function.
     */
    export type Result<T> = ResultSuccessFailure<T, FirebaseFunction.Error>;
}

export namespace FirebaseFunction {
    export function create<
        FFunction extends FirebaseFunction<unknown, FirebaseFunction.ReturnType<FFunction>>
    >(
        createFirebaseFunction: (data: unknown, auth: AuthData | undefined, logger: ILogger) => FFunction,
        getCryptionKeys: (databaseType: DatabaseType) => Crypter.Keys
    ): functions.HttpsFunction & functions.Runnable<unknown> {
        return functions
            .region('europe-west1')
            .https
            .onCall(async(data: unknown, context) => {
                const initialLogger = new DummyLogger();
                if (typeof data !== 'object' || data === null)
                    throw HttpsError('invalid-argument', 'Function parameter data has to be an object.', initialLogger);

                // Get database
                if (!('databaseType' in data) || typeof data.databaseType !== 'string')
                    throw HttpsError('invalid-argument', 'Couldn\'t get database type from function parameter data.', initialLogger);
                const databaseType = DatabaseType.fromString(data.databaseType, initialLogger.nextIndent);

                // Get logger verbose type
                let loggerVerboseType: VerboseType = 'none';
                if ('verbose' in data && (data.verbose === 'none' || data.verbose === 'verbose' || data.verbose === 'colored' || data.verbose === 'coloredVerbose')) {
                    if (databaseType.value === 'release' && data.verbose === 'verbose')
                        loggerVerboseType = 'none';
                    else if (databaseType.value === 'release' && data.verbose === 'coloredVerbose')
                        loggerVerboseType = 'colored';
                    else
                        loggerVerboseType = data.verbose;
                }

                const logger = Logger.start(loggerVerboseType, 'FirebaseFunction.create', { data: data, context: context }, 'notice');

                // Get result of function call
                const result = await executeFunction(createFirebaseFunction(data, context.auth, logger.nextIndent));

                // Encrypt result
                const crypter = new Crypter(getCryptionKeys(databaseType));
                return crypter.encodeEncrypt(result);
            });
    }
}

export async function executeFunction<
    FFunction extends FirebaseFunction<unknown, FirebaseFunction.ReturnType<FFunction>>
>(firebaseFunction: FFunction): Promise<FirebaseFunction.Result<FirebaseFunction.ReturnType<FFunction>>> {
    try {
        return await mapReturnTypeToResult(firebaseFunction.executeFunction());
    } catch (error) {
        return Result.failure<FirebaseFunction.Error>(convertToFunctionResultError(error));
    }
}

/**
 * Get the result of a promise:
 *     - Result.success if promise resolves.
 *     - Result.failure if promise rejects.
 * @template T Type of the promise.
 * @param { Promise<T> } promise Promise to get result from.
 * @return { Promise<Result<T, Error>> } Return promise.
 */
export async function mapReturnTypeToResult<T>(promise: Promise<T>): Promise<FirebaseFunction.Result<T>> {
    return await promise
        .then(value => Result.success<T>(value))
        .catch(reason => Result.failure<FirebaseFunction.Error>(convertToFunctionResultError(reason)));
}

/**
 * Check if specified status is a functions error code.
 * @param { string } status Status to check.
 * @return { boolean } true if status is a functions error code, false otherwise.
 */
function isFunctionsErrorCode(status: string): status is FunctionsErrorCode {
    return [
        'ok', 'cancelled', 'unknown', 'invalid-argument', 'deadline-exceeded', 'not-found', 'already-exists',
        'permission-denied', 'resource-exhausted', 'failed-precondition', 'aborted', 'out-of-range', 'unimplemented',
        'internal', 'unavailable', 'data-loss', 'unauthenticated'
    ].includes(status);
}

/**
 * Convert any error to a firebase function result error.
 * @param { unknown } error Error to convert.
 * @return { FirebaseFunction.Result.Error } Converted firebase function result error.
 */
function convertToFunctionResultError(error: unknown): FirebaseFunction.Error {
    const errorIsObject = error !== null && typeof error === 'object';
    const hasMessage = errorIsObject && 'message' in error && error.message !== undefined && error.message !== null && error.message !== '';
    const hasStack = errorIsObject && 'stack' in error && error.stack !== undefined && error.stack !== null && error.stack !== '';
    return {
        name: 'FirebaseFunctionError',
        code: errorIsObject && 'code' in error && typeof error.code === 'string' && isFunctionsErrorCode(error.code) ? error.code : 'unknown',
        message: hasMessage ? `${error.message}` : 'Unknown error occured, see details for more infos.',
        details: hasMessage && 'details' in error ? error.details : error,
        stack: hasStack ? `${error.stack}` : undefined
    };
}
