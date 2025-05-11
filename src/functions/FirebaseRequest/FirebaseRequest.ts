import type { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';

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

    export type ParametersData<Parameters> = {
        macTag: string;
        parameters: Flattable.Flatten<Parameters>;
    };
}
