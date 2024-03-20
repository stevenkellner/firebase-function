import type { BaseType, BaseTypeName } from '../BaseType';
import type { ILogger } from '../../logger';
import type { IParameterBuilder } from './IParameterBuilder';

export class ValueParameterBuilder<TypeName extends BaseTypeName> implements IParameterBuilder<TypeName, BaseType<TypeName>> {

    public constructor(
        private readonly typeName: TypeName
    ) {}

    public get expectedTypes(): Set<TypeName> {
        return new Set([this.typeName]);
    }

    public build(value: BaseType<TypeName>, logger: ILogger): BaseType<TypeName> {
        logger.log('ValueParameterBuilder.build', { typeName: this.typeName, value: value });
        return value;
    }
}
