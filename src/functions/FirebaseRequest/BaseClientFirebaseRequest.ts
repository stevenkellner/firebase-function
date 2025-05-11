import { type ITypeBuilder, Flattable, Result } from '@stevenkellner/typescript-common-functionality';
import type { FirebaseRequest } from './FirebaseRequest';
import { MacTag, FunctionsError } from '../utils';

export abstract class BaseClientFirebaseRequest<Parameters, ReturnType> {

    private readonly returnTypeBuilder: ITypeBuilder<Flattable.Flatten<ReturnType>, ReturnType>;

    public constructor(
        FirebaseRequest: FirebaseRequest.Constructor<Parameters, ReturnType>,
        protected readonly macKey: Uint8Array
    ) {
        const firebaseRequest = new FirebaseRequest();
        this.returnTypeBuilder = firebaseRequest.returnTypeBuilder;
    }

    protected parametersData(parameters: Parameters): FirebaseRequest.ParametersData<Parameters> {
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
