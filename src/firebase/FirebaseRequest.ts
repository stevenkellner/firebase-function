import * as functions from 'firebase-functions';
import { Logger, type ILogger } from '../logger';
import { execute, Flattable, verifyMacTag, type Flatten } from '../utils';
import type { ITypeBuilder } from '../typeBuilder';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface FirebaseRequest<Parameters, ReturnType> {

    parametersBuilder: ITypeBuilder<Flatten<Parameters>, Parameters>;

    execute(parameters: Parameters): Promise<ReturnType>;
}

export type FirebaseRequestConstructor<Parameters, ReturnType> = new (logger: ILogger) => FirebaseRequest<Parameters, ReturnType>;

export namespace FirebaseRequest {

    export function create<Parameters, ReturnType>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        FirebaseRequest: FirebaseRequestConstructor<Parameters, ReturnType>,
        macKey: Uint8Array,
        regions: string[] = []
    ): functions.HttpsFunction {
        return functions.region(...regions).https.onRequest(async (request, response) => {
            const result = await execute(async () => {

                const data = request.body as unknown as {
                    verboseLogger?: boolean;
                    macTag: string;
                    parameters: Flatten<Parameters>;
                };

                const verboseLogger = 'verboseLogger' in data && data.verboseLogger === true;
                const logger = Logger.start('FirebaseRequest.create', null, 'info', verboseLogger);

                const verified = verifyMacTag(data.macTag, data.parameters, macKey);
                if (!verified)
                    throw new functions.https.HttpsError('permission-denied', 'Invalid MAC tag');

                const firebaseRequest = new FirebaseRequest(logger.nextIndent);
                const parameters = firebaseRequest.parametersBuilder.build(data.parameters, logger.nextIndent);
                const returnValue = await firebaseRequest.execute(parameters);
                return Flattable.flatten(returnValue);
            });
            response.send(result);
        });
    }
}
