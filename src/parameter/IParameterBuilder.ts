import type { TypeFrom, TypeOfName } from './TypeOf';
import type { ILogger } from '../logger';

export interface IParameterBuilder<TypeName extends TypeOfName, T> {
    readonly expectedTypes: TypeName[];

    build(value: TypeFrom<TypeName>, logger: ILogger): T;
}

export type IParameterBuilders<Parameters extends Record<string, unknown>> = {
    [Key in keyof Parameters]: IParameterBuilder<TypeOfName, Parameters[Key]>
};
