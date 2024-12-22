import { Flattable, type Flatten, type ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import * as functions from 'firebase-functions';
import { type HttpsFunction, onRequest } from 'firebase-functions/v2/https';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import { catchErrorToResult } from './catchErrorToResult';
import { verifyMacTag } from './verifyMacTag';

export interface FirebaseRequest<Parameters, ReturnType> {

    parametersBuilder: ITypeBuilder<Flatten<Parameters>, Parameters>;

    execute(parameters: Parameters): Promise<ReturnType>;
}

export namespace FirebaseRequest {

    export type Constructor<Parameters, ReturnType> = new () => FirebaseRequest<Parameters, ReturnType>;

    export class ConstructorWrapper<Parameters, ReturnType> {

        public constructor(
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public readonly Constructor: FirebaseRequest.Constructor<Parameters, ReturnType>
        ) {}
    }

    export function create<Parameters, ReturnType>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        FirebaseRequest: FirebaseRequest.Constructor<Parameters, ReturnType>,
        macKey: Uint8Array,
        regions: SupportedRegion[] = []
    ): HttpsFunction {
        return onRequest({ region: regions }, async (request, response) => {
            const result = await catchErrorToResult(async () => {

                const data = request.body as unknown as {
                    macTag: string;
                    parameters: Flatten<Parameters>;
                };

                const verified = verifyMacTag(data.macTag, data.parameters, macKey);
                if (!verified)
                    throw new functions.https.HttpsError('permission-denied', 'Invalid MAC tag');

                const firebaseRequest = new FirebaseRequest();
                const parameters = firebaseRequest.parametersBuilder.build(data.parameters);
                const returnValue = await firebaseRequest.execute(parameters);
                return Flattable.flatten(returnValue);
            });
            response.send(result);
        });
    }
}
