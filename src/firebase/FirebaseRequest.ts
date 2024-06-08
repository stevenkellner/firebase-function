import * as functions from 'firebase-functions';
import { ParameterContainer, type IParameterContainer } from '../parameter';
import { Logger, type ILogger } from '../logger';
import { FirebaseFunction } from './FirebaseFunction';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface FirebaseRequest<Parameters, FlattenParameters, ReturnType> {

    parameters: Parameters;

    execute(): Promise<ReturnType>;
}

export type FirebaseRequestConstructor<Parameters, FlattenParameters, ReturnType> = new (parameterContainer: IParameterContainer, logger: ILogger) => FirebaseRequest<Parameters, FlattenParameters, ReturnType>;

export namespace FirebaseRequest {

    export function create<Parameters, FlattenParameters, ReturnType>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        FirebaseRequest: FirebaseRequestConstructor<Parameters, FlattenParameters, ReturnType>,
        macKey: Uint8Array,
        regions: string[] = []
    ): functions.HttpsFunction {
        return functions.region(...regions).https.onRequest(async (request, response) => {
            const result = await FirebaseFunction.execute(async () => {

                const data = request.body as unknown as {
                    verboseLogger?: boolean;
                    macTag: string;
                    parameters: Record<string, unknown>;
                };

                const verboseLogger = 'verboseLogger' in data && data.verboseLogger === true;
                const logger = Logger.start('FirebaseRequest.create', null, 'info', verboseLogger);

                const verified = FirebaseFunction.verifyMacTag(data.macTag, data.parameters, macKey);
                if (!verified)
                    throw new functions.https.HttpsError('permission-denied', 'Invalid MAC tag');

                const parameterContainer = new ParameterContainer(data.parameters, logger.nextIndent);
                const firebaseRequest = new FirebaseRequest(parameterContainer, logger.nextIndent);
                const returnValue = await firebaseRequest.execute();
                return FirebaseFunction.Flattable.flatten(returnValue);
            });
            response.send(result);
        });
    }
}
