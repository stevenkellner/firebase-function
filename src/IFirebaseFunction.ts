import * as functions from 'firebase-functions';
import { CallSecret, DatabaseType, FirebaseError, type FirebaseResult, HttpsError, type IFunctionType, type PrivateKeys, Result } from './types';
import { DatabaseReference, type IDatabaseReference, type IDatabaseScheme } from './database';
import { type ILogger, Logger, VoidLogger } from './logger';
import { type IParameterContainer, ParameterContainer } from './parameter';
import type { AuthData } from 'firebase-functions/lib/common/providers/https';

export interface IFirebaseFunction<FunctionType extends IFunctionType.Erased, ResponseContext = never> {
    parameters: IFunctionType.Parameters<FunctionType>;
    responseContext?: ResponseContext;

    execute(): Promise<IFunctionType.ReturnType<FunctionType>>;
}

export namespace IFirebaseFunction {
    export type Constructor<FunctionType extends IFunctionType.Erased, ResponseContext, DatabaseScheme extends IDatabaseScheme> = new(parameterContainer: IParameterContainer, auth: AuthData | null, databaseReference: IDatabaseReference<DatabaseScheme>, logger: ILogger) => IFirebaseFunction<FunctionType, ResponseContext>;

    async function execute<FunctionType extends IFunctionType.Erased, ResponseContext>(
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

    export function create<FunctionType extends IFunctionType.Erased, ResponseContext, DatabaseScheme extends IDatabaseScheme>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        FirebaseFunction: IFirebaseFunction.Constructor<FunctionType, ResponseContext, DatabaseScheme>,
        getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys
    ): functions.HttpsFunction & functions.Runnable<unknown> {
        return functions
            .region('europe-west1')
            .https
            .onCall(async (data: unknown, context) => {
                /*
                const initialLogger = new VoidLogger();
                if (typeof data !== 'object' || data === null)
                    throw HttpsError('invalid-argument', 'Function parameter data has to be an object.', initialLogger);

                // Get database
                if (!('databaseType' in data) || typeof data.databaseType !== 'string')
                    throw HttpsError('invalid-argument', 'Couldn\'t get database type from function parameter data.', initialLogger);
                const databaseType = DatabaseType.fromString(data.databaseType, initialLogger.nextIndent);

                // Get logger verbose type
                // if (!('verbose' in data) || typeof data.verbose !== 'string')
                //    throw HttpsError('invalid-argument', 'Couldn\'t get verbose type from function parameter data.', initialLogger);
                // const loggerVerboseType = VerboseType.fromString(data.verbose, databaseType, initialLogger.nextIndent);

                const logger = Logger.start('FirebaseFunction.create', { auth: context.auth }, 'notice', true);

                // Check call secret
                if (!('callSecret' in data) || typeof data.callSecret !== 'object')
                    throw HttpsError('invalid-argument', 'Couldn\'t get call secret from function parameter data.', logger);
                const callSecret = CallSecret.fromObject(data.callSecret, logger.nextIndent);
                CallSecret.checkCallSecret(callSecret, getPrivateKeys(databaseType).callSecretKey, logger.nextIndent);

                // Get result of function call
                const crypter = new Crypter(getPrivateKeys(databaseType).cryptionKeys);
                const parameterContainer = new ParameterContainer({ ...data, databaseType: databaseType }, logger.nextIndent);
                const databaseReference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(databaseType));
                const firebaseFunction = new FirebaseFunction(parameterContainer, context.auth ?? null, databaseReference, logger.nextIndent);
                const response = await execute(firebaseFunction);

                // Encrypt result
                return {
                    result: crypter.encodeEncrypt(response.result),
                    context: response.context
                };
                */
            });
    }
}
