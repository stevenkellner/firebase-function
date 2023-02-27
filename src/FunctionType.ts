export interface FunctionType<Parameters, ReturnType, FlattenParameters = undefined> {
    parameters: Parameters;
    return: ReturnType;
    flattenParameters: FlattenParameters;
}

export namespace FunctionType {
    export type Parameters<T extends FunctionType<unknown, unknown, unknown>> = T extends FunctionType<infer Parameters, unknown, unknown> ? Parameters : never;

    export type ReturnType<T extends FunctionType<unknown, unknown, unknown>> = T extends FunctionType<unknown, infer ReturnType, unknown> ? ReturnType : never;

    export type FlattenParameters<T extends FunctionType<unknown, unknown, unknown>> = T extends FunctionType<unknown, unknown, infer FlattenParameters> ? (FlattenParameters extends undefined ? Parameters<T> : FlattenParameters) : never;
}
