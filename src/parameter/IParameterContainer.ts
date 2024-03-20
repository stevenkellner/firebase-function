import type { BaseTypeName } from './BaseType';
import type { IParameterBuilder } from './parameterBuilder/IParameterBuilder';

export interface IParameterContainer {

    parameter<TypeName extends BaseTypeName, T>(key: PropertyKey, builder: IParameterBuilder<TypeName, T>): T;
}
