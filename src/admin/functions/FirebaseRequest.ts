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

    protected constructor(requestName: string) {
        this.logger.notice(`${requestName}.constructor`);
    }

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

    export type Parameters<Request extends FirebaseRequest<any, any> | Constructor<any, any> | ConstructorWrapper<any, any>> =
        Request extends FirebaseRequest<infer Parameters, any> ? Parameters :
            Request extends Constructor<infer Parameters, any> ? Parameters :
                Request extends ConstructorWrapper<infer Parameters, any> ? Parameters : never;

    export type ReturnType<Request extends FirebaseRequest<any, any> | Constructor<any, any> | ConstructorWrapper<any, any> > =
        Request extends FirebaseRequest<any, infer ReturnType> ? ReturnType :
            Request extends Constructor<any, infer ReturnType> ? ReturnType :
                Request extends ConstructorWrapper<any, infer ReturnType> ? ReturnType : never;

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
