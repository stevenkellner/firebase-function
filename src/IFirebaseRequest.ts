import * as functions from 'firebase-functions';
import { DatabaseReference, type IDatabaseReference, type IDatabaseScheme } from './database';
import { DatabaseType, HttpsError, type IFunctionType, type PrivateKeys } from './types';
import { type ILogger, Logger, VoidLogger } from './logger';
import { type IParameterContainer, ParameterContainer } from './parameter';

export interface IFirebaseRequest<FunctionType extends IFunctionType.Erased> {
    parameters: IFunctionType.Parameters<FunctionType>;

    execute(): Promise<IFunctionType.ReturnType<FunctionType>>;
}

export namespace IFirebaseRequest {
    export type Constructor<FunctionType extends IFunctionType.Erased, DatabaseScheme extends IDatabaseScheme> = new (parameterContainer: IParameterContainer, databaseReference: IDatabaseReference<DatabaseScheme>, logger: ILogger) => IFirebaseRequest<FunctionType>;

    export function create<FunctionType extends IFunctionType.Erased, DatabaseScheme extends IDatabaseScheme>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        FirebaseRequest: IFirebaseRequest.Constructor<FunctionType, DatabaseScheme>,
        getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys
    ): functions.HttpsFunction {
        return functions
            .region('europe-west1')
            .https
            .onRequest(async (request, response) => {
                const initialLogger = new VoidLogger();

                // Get database
                let databaseType = new DatabaseType('release');
                if ('databaseType' in request.query) {
                    if (typeof request.query.databaseType !== 'string')
                        throw HttpsError('invalid-argument', 'Couldn\'t get database type from function parameter data.', initialLogger);
                    databaseType = DatabaseType.fromString(request.query.databaseType, initialLogger.nextIndent);
                }

                // Get logger verbose type
                // let loggerVerboseType = new VerboseType('none');
                // if ('verbose' in request.query) {
                //     if (typeof request.query.verbose !== 'string')
                //         throw HttpsError('invalid-argument', 'Couldn\'t get verbose type from function parameter data.', initialLogger);
                //     loggerVerboseType = VerboseType.fromString(request.query.verbose, databaseType, initialLogger.nextIndent);
                // }

                const logger = Logger.start('FirebaseRequest.create', null, 'notice', true);

                // Get response of function call
                const parameterContainer = new ParameterContainer({ ...request.query, databaseType: databaseType }, logger.nextIndent);
                const databaseReference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(databaseType));
                const firebaseRequest = new FirebaseRequest(parameterContainer, databaseReference, logger.nextIndent);
                response.send(await firebaseRequest.execute());
            });
    }
}
