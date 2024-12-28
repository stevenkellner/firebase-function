import { Flattable, Logger, type ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { type HttpsFunction, onRequest } from 'firebase-functions/v2/https';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import { catchErrorToResult } from './catchErrorToResult';
import { verifyMacTag } from './verifyMacTag';
import { FunctionsLogger } from '../logger';
import { FunctionsError } from '../../shared/functions/FunctionsError';

export abstract class FirebaseRequest<Parameters, ReturnType> {

    protected logger = new Logger(new FunctionsLogger());

    public abstract parametersBuilder: ITypeBuilder<Flattable.Flatten<Parameters>, Parameters>;

    public abstract execute(parameters: Parameters): Promise<ReturnType>;
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
                    parameters: Flattable.Flatten<Parameters>;
                };

                const verified = verifyMacTag(data.macTag, data.parameters, macKey);
                if (!verified)
                    throw new FunctionsError('failed-precondition', 'Invalid MAC tag');

                const firebaseRequest = new FirebaseRequest();
                const parameters = firebaseRequest.parametersBuilder.build(data.parameters);
                return firebaseRequest.execute(parameters);
            });
            response.send(Flattable.flatten(result));
        });
    }
}
