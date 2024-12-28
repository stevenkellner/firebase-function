import { Result, Flattable, type ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { type HttpsCallable, httpsCallable, type Functions } from 'firebase/functions';
import { createMacTag } from './createMacTag';
import { FunctionsError } from '../../shared/functions';

type FunctionCallable<Parameters, ReturnType> = HttpsCallable<{
    macTag: string;
    parameters: Flattable.Flatten<Parameters>;
}, Result.Flatten<ReturnType, FunctionsError>>;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export abstract class IFirebaseFunction<Parameters, ReturnType> {

    protected parameters: Parameters = null as unknown as Parameters;

    public abstract returnTypeBuilder: ITypeBuilder<Flattable.Flatten<ReturnType>, ReturnType>;
}

// istanbul ignore next
export namespace IFirebaseFunction {

    export type Constructor<Parameters, ReturnType> = new () => IFirebaseFunction<Parameters, ReturnType>;

    export class ConstructorWrapper<Parameters, ReturnType> {

        public constructor(
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public readonly Constructor: IFirebaseFunction.Constructor<Parameters, ReturnType>
        ) {}
    }
}

export class FirebaseFunction<Parameters, ReturnType> {

    public constructor(
        private readonly functions: Functions,
        private readonly name: string,
        private readonly macKey: Uint8Array,
        private readonly returnTypeBuilder: ITypeBuilder<Flattable.Flatten<ReturnType>, ReturnType>
    ) {}

    public async execute(parameters: Parameters): Promise<ReturnType> {
        const _function: FunctionCallable<Parameters, ReturnType> = httpsCallable(this.functions, this.name);
        const flattenParameters = Flattable.flatten(parameters);
        const macTag = createMacTag(flattenParameters, this.macKey);
        const flattenResult = await _function({
            macTag: macTag,
            parameters: flattenParameters
        });
        const resultBuilder = Result.builder(this.returnTypeBuilder, FunctionsError.builder);
        const result = resultBuilder.build(flattenResult.data);
        return result.get();
    }
}

// istanbul ignore next
export namespace FirebaseFunction {

    export function create<Parameters, ReturnType>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        IFirebaseFunction: IFirebaseFunction.Constructor<Parameters, ReturnType>,
        functions: Functions,
        name: string,
        macKey: Uint8Array
    ): FirebaseFunction<Parameters, ReturnType> {
        return new FirebaseFunction(functions, name, macKey, new IFirebaseFunction().returnTypeBuilder);
    }
}
