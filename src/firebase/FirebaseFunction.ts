import * as functions from 'firebase-functions';
import type { AuthData, CallableRequest } from 'firebase-functions/lib/common/providers/https';
import { Logger, type ILogger } from '../logger';
import { execute, Flattable, verifyMacTag, type Flatten } from '../utils';
import type { ITypeBuilder } from '../typeBuilder';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import { type CallableFunction, onCall } from 'firebase-functions/v2/https';

export interface FirebaseFunction<Parameters, ReturnType> {

    parametersBuilder: ITypeBuilder<Flatten<Parameters>, Parameters>;

    execute(parameters: Parameters): Promise<ReturnType>;
}

export type FirebaseFunctionConstructor<Parameters, ReturnType> = new (auth: AuthData | null, logger: ILogger) => FirebaseFunction<Parameters, ReturnType>;

export namespace FirebaseFunction {

    export function create<Parameters, ReturnType>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        FirebaseFunction: FirebaseFunctionConstructor<Parameters, ReturnType>,
        macKey: Uint8Array,
        regions: SupportedRegion[] = []
    ): CallableFunction<any, any> {
        return onCall({ region: regions }, async (request: CallableRequest<{
            verboseLogger?: boolean;
            macTag: string;
            parameters: Flatten<Parameters>;
        }>) => {
            const result = await execute(async () => {

                const verboseLogger = 'verboseLogger' in request.data && request.data.verboseLogger === true;
                const logger = Logger.start('FirebaseFunction.create', null, 'info', verboseLogger);

                const verified = verifyMacTag(request.data.macTag, request.data.parameters, macKey);
                if (!verified)
                    throw new functions.https.HttpsError('permission-denied', 'Invalid MAC tag');

                const firebaseFunction = new FirebaseFunction(request.auth ?? null, logger.nextIndent);
                const parameters = firebaseFunction.parametersBuilder.build(request.data.parameters, logger.nextIndent);
                const returnValue = await firebaseFunction.execute(parameters);
                return Flattable.flatten(returnValue);
            });
            return result;
        });
    }
}
