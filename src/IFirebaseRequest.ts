import * as functions from 'firebase-functions';
import { DummyLogger, type ILogger, VerboseType, Logger } from './logger';
import { type IFunctionType, DatabaseType, HttpsError, type PrivateKeys } from './types';
import { ParameterContainer, type IParameterContainer } from './parameter';
import { DatabaseReference, type IDatabaseScheme, type IDatabaseReference } from './database';

export interface IFirebaseRequest<FunctionType extends IFunctionType.Erased> {
    parameters: IFunctionType.Parameters<FunctionType>;

    execute(): Promise<IFunctionType.ReturnType<FunctionType>>;
}

export namespace IFirebaseRequest {
    export type Constructor<FunctionType extends IFunctionType.Erased, DatabaseScheme extends IDatabaseScheme> = new (parameterContainer: IParameterContainer, databaseReference: IDatabaseReference<DatabaseScheme>, logger: ILogger) => IFirebaseRequest<FunctionType>;

    export function create<FunctionType extends IFunctionType.Erased, DatabaseScheme extends IDatabaseScheme>(
        FirebaseRequest: IFirebaseRequest.Constructor<FunctionType, DatabaseScheme>,
        getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys
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
                const parameterContainer = new ParameterContainer({ ...request.query, databaseType: databaseType }, null, logger.nextIndent);
                const databaseReference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(databaseType));
                const firebaseRequest = new FirebaseRequest(parameterContainer, databaseReference, logger.nextIndent);
                response.send(await firebaseRequest.execute());
            });
    }
}
