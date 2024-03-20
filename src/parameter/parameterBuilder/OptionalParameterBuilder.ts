import type { BaseType, BaseTypeName } from '../BaseType';
import type { ILogger } from '../../logger';
import type { IParameterBuilder } from './IParameterBuilder';

export class OptionalParameterBuilder<TypeName extends BaseTypeName, T> implements IParameterBuilder<TypeName | 'undefined', T | undefined> {

    public constructor(
        private readonly builder: IParameterBuilder<TypeName, T>
    ) {}

    public get expectedTypes(): Set<TypeName | 'undefined'> {
        const expectedTypes = new Set<TypeName | 'undefined'>(this.builder.expectedTypes);
        expectedTypes.add('undefined');
        return expectedTypes;
    }

    public build(value: BaseType<TypeName | 'undefined'>, logger: ILogger): T | undefined {
        logger.log('OptionalParameterBuilder.build', { expectedTypes: this.builder.expectedTypes, value: value });
        if (typeof value === 'undefined')
            // eslint-disable-next-line no-undefined
            return undefined;
        return this.builder.build(value, logger.nextIndent);
    }
}
