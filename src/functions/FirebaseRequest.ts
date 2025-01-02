import { Flattable, Result, type ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { type HttpsFunction, onRequest } from 'firebase-functions/v2/https';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import { FunctionsError } from './FunctionsError';
import { MacTag } from './MacTag';
import { convertErrorToResult } from './convertErrorToResult';
import * as axios from 'axios';

export abstract class FirebaseRequest<Parameters, ReturnType> {

    public abstract readonly parametersBuilder: ITypeBuilder<Flattable.Flatten<Parameters>, Parameters>;

    public abstract readonly returnTypeBuilder: ITypeBuilder<Flattable.Flatten<ReturnType>, ReturnType>;

    public abstract execute(parameters: Parameters): Promise<ReturnType>;
}

export namespace FirebaseRequest {

    export type Constructor<Parameters, ReturnType> = new () => FirebaseRequest<Parameters, ReturnType>;

    export type Parameters<Request extends FirebaseRequest<any, any> | Constructor<any, any>> =
        Request extends FirebaseRequest<infer Parameters, any> ? Parameters :
            Request extends Constructor<infer Parameters, any> ? Parameters : never;

    export type ReturnType<Request extends FirebaseRequest<any, any> | Constructor<any, any> > =
        Request extends FirebaseRequest<any, infer ReturnType> ? ReturnType :
            Request extends Constructor<any, infer ReturnType> ? ReturnType : never;

    type RawParameters<Parameters> = {
        macTag: string;
        parameters: Flattable.Flatten<Parameters>;
    };

    export class AdminRequest<Parameters, ReturnType> {

        public constructor(
            private readonly FirebaseRequest: FirebaseRequest.Constructor<Parameters, ReturnType>,
            private readonly macKey: Uint8Array
        ) {}

        private async execute(input: RawParameters<Parameters>): Promise<ReturnType> {
            const macTag = new MacTag(this.macKey);
            if (!macTag.verified(input.macTag, input.parameters))
                throw new FunctionsError('failed-precondition', 'Invalid MAC tag');

            const firebaseRequest = new this.FirebaseRequest();
            const parameters = firebaseRequest.parametersBuilder.build(input.parameters);
            return firebaseRequest.execute(parameters);
        }

        public runnable(regions: SupportedRegion[]): HttpsFunction {
            return onRequest({ region: regions }, async (request, response) => {
                const result = await convertErrorToResult(async () => this.execute(request.body));
                const flattenResult = Flattable.flatten(result);
                response.send(flattenResult);
            });
        }
    }

    class RequestCallable<Parameters, ReturnType> {

        public constructor(
            private readonly baseUrl: string,
            private readonly region: SupportedRegion,
            private readonly name: string
        ) {}

        private get url(): string {
            return `${this.baseUrl}/${this.region}/${this.name}`;
        }

        public async call(parameters: {
            macTag: string;
            parameters: Flattable.Flatten<Parameters>;
        }): Promise<Result.Flatten<ReturnType, FunctionsError>> {
            return (await axios.default.post(this.url, parameters)).data;
        }
    }

    export class ClientRequest<Parameters, ReturnType> {

        public constructor(
            private readonly FirebaseRequest: FirebaseRequest.Constructor<Parameters, ReturnType>,
            private readonly macKey: Uint8Array,
            private readonly baseUrl: string,
            private readonly region: SupportedRegion,
            private readonly name: string
        ) {}

        public async execute(parameters: Parameters): Promise<ReturnType> {
            const firebaseRequest = new this.FirebaseRequest();
            const request = new RequestCallable<Parameters, ReturnType>(this.baseUrl, this.region, this.name);
            const flattenParameters = Flattable.flatten(parameters);
            const macTag = new MacTag(this.macKey);
            const flattenResult = await request.call({
                macTag: macTag.create(flattenParameters),
                parameters: flattenParameters
            });
            const resultBuilder = Result.builder(firebaseRequest.returnTypeBuilder, FunctionsError.builder);
            const result = resultBuilder.build(flattenResult);
            return result.get();
        }
    }
}
