import type { BaseType, BaseTypeName } from '../BaseType';
import type { ILogger } from '../../logger';
import type { IParameterBuilder } from './IParameterBuilder';

export class ParameterBuilder<TypeName extends BaseTypeName, T> implements IParameterBuilder<TypeName, T> {

    public constructor(
        private readonly typeName: TypeName,
        private readonly buildParameter: (value: BaseType<TypeName>, logger: ILogger) => T
    ) {}

    public get expectedTypes(): Set<TypeName> {
        return new Set([this.typeName]);
    }

    public build(value: BaseType<TypeName>, logger: ILogger): T {
        logger.log('ParameterBuilder.build', { typeName: this.typeName, value: value });
        return this.buildParameter(value, logger.nextIndent);
    }
}
