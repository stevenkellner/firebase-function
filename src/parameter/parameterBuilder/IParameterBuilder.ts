import type { BaseType, BaseTypeName } from '../BaseType';
import type { ILogger } from '../../logger';

export interface IParameterBuilder<TypeName extends BaseTypeName, T> {

    readonly expectedTypes: Set<TypeName>;

    build(value: BaseType<TypeName>, logger: ILogger): T;
}
