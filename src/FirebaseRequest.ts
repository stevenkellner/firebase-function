import * as functions from 'firebase-functions';
import { DummyLogger, type ILogger, VerboseType, Logger } from './logger';
import { type FunctionType } from './FunctionType';
import { type ValidReturnType } from './ValidReturnType';
import { DatabaseType } from './DatabaseType';
import { HttpsError } from './HttpsError';

export type FirebaseRequestConstructor<FFunctionType extends FunctionType<unknown, ValidReturnType, Record<string, string>>> = new (params: Record<PropertyKey, unknown> & { databaseType: DatabaseType }, logger: ILogger) => FirebaseRequest<FFunctionType>;
export interface FirebaseRequest<FFunctionType extends FunctionType<unknown, ValidReturnType, unknown>> {

    parameters: FunctionType.Parameters<FFunctionType>;

    executeFunction(): Promise<FunctionType.ReturnType<FFunctionType>>;
}

export namespace FirebaseRequest {
    export function create<
        FFunctionType extends FunctionType<unknown, ValidReturnType, Record<string, string>>
    >(
        FirebaseRequest: FirebaseRequestConstructor<FFunctionType>
    ): functions.HttpsFunction {
        return functions
            .region('europe-west1')
            .https
            .onRequest(async(request, response) => {
                const initialLogger = new DummyLogger();

                // Get database
                let databaseType = new DatabaseType('release');
                if ('databaseType' in request.query) {
                    if (typeof request.query.databaseType !== 'string')
                        throw HttpsError('invalid-argument', 'Couldn\'t get database type from function parameter data.', initialLogger);
                    databaseType = DatabaseType.fromString(request.query.databaseType, initialLogger.nextIndent);
                }

                // Get logger verbose type
                let loggerVerboseType = new VerboseType('none');
                if ('verbose' in request.query) {
                    if (typeof request.query.verbose !== 'string')
                        throw HttpsError('invalid-argument', 'Couldn\'t get verbose type from function parameter data.', initialLogger);
                    loggerVerboseType = VerboseType.fromString(request.query.verbose, databaseType, initialLogger.nextIndent);
                }

                const logger = Logger.start(loggerVerboseType, 'FirebaseRequest.create', undefined, 'notice');

                // Get response of function call
                const firebaseRequest = new FirebaseRequest({
                    ...request.query,
                    databaseType: databaseType
                }, logger.nextIndent);
                response.send(await firebaseRequest.executeFunction());
            });
    }
}
