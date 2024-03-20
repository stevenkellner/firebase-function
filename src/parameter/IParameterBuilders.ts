import type { BaseTypeName } from './BaseType';
import type { IParameterBuilder } from './parameterBuilder';

export type IParameterBuilders<Parameters extends Record<string, unknown>> = {
    [Key in keyof Parameters]: IParameterBuilder<BaseTypeName, Parameters[Key]>
};
