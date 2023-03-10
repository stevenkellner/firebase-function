import * as functions from 'firebase-functions';
import { type AuthData, type FunctionsErrorCode } from 'firebase-functions/lib/common/providers/https';
import { CallSecret } from './CallSecret';
import { Crypter } from './crypter/Crypter';
import { DatabaseType } from './DatabaseType';
import { type FunctionType } from './FunctionType';
import { HttpsError } from './HttpsError';
import { type ILogger, Logger, type VerboseType, DummyLogger } from './logger';
import { type PrivateKeys } from './PrivateKeys';
import { Result, type Result as ResultSuccessFailure } from './Result';
import { type ValidReturnType } from './ValidReturnType';

export type FirebaseFunctionType<FFunctionType extends FunctionType<unknown, ValidReturnType, unknown>> = new (data: Record<PropertyKey, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, logger: ILogger) => FirebaseFunction<FFunctionType>;

export interface FirebaseFunction<FFunctionType extends FunctionType<unknown, ValidReturnType, unknown>> {

    parameters: FunctionType.Parameters<FFunctionType>;

    executeFunction(): Promise<FunctionType.ReturnType<FFunctionType>>;
}

export namespace FirebaseFunction {
    export interface Error {
        name: 'FirebaseFunctionError';
        code: FunctionsErrorCode;
        message: string;
        details?: unknown;
        stack?: string;
    }

    export type Result<T> = ResultSuccessFailure<T, FirebaseFunction.Error>;

    export function create<
        FFunctionType extends FunctionType<unknown, ValidReturnType, unknown>
    >(
        FirebaseFunction: FirebaseFunctionType<FFunctionType>,
        getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys
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

                // Check call secret
                if (!('callSecret' in data) || typeof data.callSecret !== 'object')
                    throw HttpsError('invalid-argument', 'Couldn\'t get call secret from function parameter data.', logger);
                const callSecret = CallSecret.fromObject(data.callSecret, logger.nextIndent);
                CallSecret.checkCallSecret(callSecret, getPrivateKeys(databaseType).callSecretKey, logger.nextIndent);

                // Get result of function call
                const result = await executeFunction(new FirebaseFunction({
                    ...data,
                    databaseType: databaseType
                }, context.auth, logger.nextIndent));

                // Encrypt result
                const crypter = new Crypter(getPrivateKeys(databaseType).cryptionKeys);
                return crypter.encodeEncrypt(result);
            });
    }
}

export async function executeFunction<
    FFunctionType extends FunctionType<unknown, ValidReturnType, unknown>
>(firebaseFunction: FirebaseFunction<FFunctionType>): Promise<FirebaseFunction.Result<FunctionType.ReturnType<FFunctionType>>> {
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
