import { type ValidReturnType } from './ValidReturnType';

export interface IFunctionType<Parameters, ReturnType extends ValidReturnType, FlattenParameters = undefined> {
    parameters: Parameters;
    return: ReturnType;
    flattenParameters: FlattenParameters;
}

export namespace IFunctionType {
    export type Erased = IFunctionType<unknown, ValidReturnType, unknown>;

    export type Parameters<T extends IFunctionType.Erased> = T extends IFunctionType<infer Parameters, ValidReturnType, unknown> ? Parameters : never;

    export type ReturnType<T extends IFunctionType.Erased> = T extends IFunctionType<unknown, infer ReturnType, unknown> ? ReturnType : never;

    export type FlattenParameters<T extends IFunctionType.Erased> = T extends IFunctionType<unknown, ValidReturnType, infer FlattenParameters> ? (FlattenParameters extends undefined ? Parameters<T> : FlattenParameters) : never;
}
