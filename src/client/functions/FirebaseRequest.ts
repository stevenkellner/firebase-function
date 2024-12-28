import { Result, Flattable, type Flatten, type ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { createMacTag } from './createMacTag';
import { FunctionsError } from '../../shared/functions';
import * as axios from 'axios';
import type { SupportedRegion } from 'firebase-functions/options';

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
        parameters: Flatten<Parameters>;
    }): Promise<Flatten<Result<ReturnType, FunctionsError>>> {
        return (await axios.default.post(this.url, parameters)).data;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export abstract class IFirebaseRequest<Parameters, ReturnType> {

    protected parameters: Parameters = null as unknown as Parameters;

    public abstract returnTypeBuilder: ITypeBuilder<Flatten<ReturnType>, ReturnType>;
}

export namespace IFirebaseRequest {

    export type Constructor<Parameters, ReturnType> = new () => IFirebaseRequest<Parameters, ReturnType>;

    export class ConstructorWrapper<Parameters, ReturnType> {

        public constructor(
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public readonly Constructor: IFirebaseRequest.Constructor<Parameters, ReturnType>
        ) {}
    }
}

export class FirebaseRequest<Parameters, ReturnType> {

    public constructor(
        private readonly baseUrl: string,
        private readonly region: SupportedRegion,
        private readonly name: string,
        private readonly macKey: Uint8Array,
        private readonly returnTypeBuilder: ITypeBuilder<Flatten<ReturnType>, ReturnType>
    ) {}

    public async execute(parameters: Parameters): Promise<ReturnType> {
        const request = new RequestCallable<Parameters, ReturnType>(this.baseUrl, this.region, this.name);
        const flattenParameters = Flattable.flatten(parameters);
        const macTag = createMacTag(flattenParameters, this.macKey);
        const flattenResult = await request.call({
            macTag: macTag,
            parameters: flattenParameters
        });
        const resultTypeBuilder = new Result.TypeBuilder(this.returnTypeBuilder, new FunctionsError.TypeBuilder());
        const result = resultTypeBuilder.build(Result.from(flattenResult));
        return result.get();
    }
}

export namespace FirebaseRequest {

    export function create<Parameters, ReturnType>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        IFirebaseRequest: IFirebaseRequest.Constructor<Parameters, ReturnType>,
        baseUrl: string,
        region: SupportedRegion,
        name: string,
        macKey: Uint8Array
    ): FirebaseRequest<Parameters, ReturnType> {
        return new FirebaseRequest(baseUrl, region, name, macKey, new IFirebaseRequest().returnTypeBuilder);
    }
}
