import * as functions from 'firebase-functions';
import { type AuthData } from 'firebase-functions/lib/common/providers/https';
import { CallSecret, DatabaseType, type IFunctionType, HttpsError, type PrivateKeys, Result, type FirebaseResult, FirebaseError } from './types';
import { type ILogger, Logger, VerboseType, DummyLogger } from './logger';
import { Crypter } from './crypter';
import { ParameterContainer, type IParameterContainer } from './parameter';
import { DatabaseReference, type IDatabaseReference, type IDatabaseScheme } from './database';

export interface IFirebaseFunction<FunctionType extends IFunctionType.Erased, ResponseContext> {
    parameters: IFunctionType.Parameters<FunctionType>;
    responseContext?: ResponseContext;

    execute(): Promise<IFunctionType.ReturnType<FunctionType>>;
}

declare let IFirebaseFunction: FirebaseFunction.Constructor<IFunctionType.Erased, unknown>;

export namespace FirebaseFunction {
    export type Constructor<FunctionType extends IFunctionType.Erased, ResponseContext> = new(parameterContainer: IParameterContainer, auth: AuthData | null, databaseReference: IDatabaseReference<IDatabaseScheme>, logger: ILogger) => IFirebaseFunction<FunctionType, ResponseContext>;

    export function create<FunctionType extends IFunctionType.Erased, ResponseContext>(
        FirebaseFunction: FirebaseFunction.Constructor<FunctionType, ResponseContext>,
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
                if (!('verbose' in data) || typeof data.verbose !== 'string')
                    throw HttpsError('invalid-argument', 'Couldn\'t get verbose type from function parameter data.', initialLogger);
                const loggerVerboseType = VerboseType.fromString(data.verbose, databaseType, initialLogger.nextIndent);

                const logger = Logger.start(loggerVerboseType, 'FirebaseFunction.create', { auth: context.auth }, 'notice');

                // Check call secret
                if (!('callSecret' in data) || typeof data.callSecret !== 'object')
                    throw HttpsError('invalid-argument', 'Couldn\'t get call secret from function parameter data.', logger);
                const callSecret = CallSecret.fromObject(data.callSecret, logger.nextIndent);
                CallSecret.checkCallSecret(callSecret, getPrivateKeys(databaseType).callSecretKey, logger.nextIndent);

                // Get result of function call
                const crypter = new Crypter(getPrivateKeys(databaseType).cryptionKeys);
                const parameterContainer = new ParameterContainer({ ...data, databaseType: databaseType }, crypter, logger.nextIndent);
                const databaseReference = DatabaseReference.base(getPrivateKeys(databaseType));
                const firebaseFunction = new FirebaseFunction(parameterContainer, context.auth ?? null, databaseReference, logger.nextIndent);
                const response = await execute(firebaseFunction);

                // Encrypt result
                return {
                    result: crypter.encodeEncrypt(response.result),
                    context: response.context
                };
            });
    }

    export async function execute<FunctionType extends IFunctionType.Erased, ResponseContext>(
        firebaseFunction: IFirebaseFunction<FunctionType, ResponseContext>
    ): Promise<{ result: FirebaseResult<IFunctionType.ReturnType<FunctionType>>; context: ResponseContext | null }> {
        try {
            return {
                result: await firebaseFunction.execute()
                    .then(value => Result.success(value))
                    .catch(error => Result.failure(FirebaseError.toFirebaseError(error))),
                context: firebaseFunction.responseContext ?? null
            };
        } catch (error) {
            return {
                result: Result.failure(FirebaseError.toFirebaseError(error)),
                context: firebaseFunction.responseContext ?? null
            };
        }
    }
}
