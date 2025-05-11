import { type ITypeBuilder, Flattable, Result } from '@stevenkellner/typescript-common-functionality';
import type { FirebaseFunction } from './FirebaseFunction';
import { MacTag, FunctionsError } from '../utils';

export abstract class BaseClientFirebaseFunction<Parameters, ReturnType> {

    private readonly returnTypeBuilder: ITypeBuilder<Flattable.Flatten<ReturnType>, ReturnType>;

    public constructor(
        FirebaseFunction: FirebaseFunction.Constructor<Parameters, ReturnType>,
        protected readonly macKey: Uint8Array
    ) {
        const firebaseFunction = new FirebaseFunction();
        this.returnTypeBuilder = firebaseFunction.returnTypeBuilder;
    }

    protected parametersData(parameters: Parameters): FirebaseFunction.ParametersData<Parameters> {
        const flattenParameters = Flattable.flatten(parameters);
        const macTag = new MacTag(this.macKey);
        return {
            macTag: macTag.create(flattenParameters),
            parameters: flattenParameters
        };
    }

    protected result(flattenResult: Result.Flatten<ReturnType, FunctionsError>): Result<ReturnType, FunctionsError> {
        const resultBuilder = Result.builder(this.returnTypeBuilder, FunctionsError.builder);
        return resultBuilder.build(flattenResult);
    }

    public abstract executeWithResult(parameters: Parameters): Promise<Result<ReturnType, FunctionsError>>;

    public async execute(parameters: Parameters): Promise<ReturnType> {
        const result = await this.executeWithResult(parameters);
        return result.get();
    }
}
