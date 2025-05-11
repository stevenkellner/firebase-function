import type { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';

export abstract class FirebaseFunction<Parameters, ReturnType> {

    public abstract readonly parametersBuilder: ITypeBuilder<Flattable.Flatten<Parameters>, Parameters>;

    public abstract readonly returnTypeBuilder: ITypeBuilder<Flattable.Flatten<ReturnType>, ReturnType>;

    public userId: string | null = null;

    public abstract execute(parameters: Parameters): Promise<ReturnType>;
}

export namespace FirebaseFunction {

    export type Constructor<Parameters, ReturnType> = new () => FirebaseFunction<Parameters, ReturnType>;

    export type Parameters<Function extends FirebaseFunction<any, any> | Constructor<any, any>> =
        Function extends FirebaseFunction<infer Parameters, any> ? Parameters :
            Function extends Constructor<infer Parameters, any> ? Parameters : never;

    export type ReturnType<Function extends FirebaseFunction<any, any> | Constructor<any, any>> =
        Function extends FirebaseFunction<any, infer ReturnType> ? ReturnType :
            Function extends Constructor<any, infer ReturnType> ? ReturnType : never;

    export type ParametersData<Parameters> = {
        macTag: string;
        parameters: Flattable.Flatten<Parameters>;
    };
}
