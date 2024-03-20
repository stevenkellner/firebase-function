import type { BaseType, BaseTypeName } from '../BaseType';
import type { ILogger } from '../../logger';
import type { IParameterBuilder } from './IParameterBuilder';
import { HttpsError } from '../../utils';

export class ArrayParameterBuilder<TypeName extends BaseTypeName, T> implements IParameterBuilder<'object', T[]> {

    public constructor(
        private readonly builder: IParameterBuilder<TypeName, T>,
        private readonly length: number | null = null
    ) {}

    public get expectedTypes(): Set<'object'> {
        return new Set(['object']);
    }

    public build(value: BaseType<'object'>, logger: ILogger): T[] {
        logger.log('ArrayParameterBuilder.build', { expectedTypes: this.builder.expectedTypes, value: value, length: this.length });
        if (value === null || !Array.isArray(value))
            throw new HttpsError('invalid-argument', 'Value is not an array.', logger);
        if (this.length !== null && value.length !== this.length)
            throw new HttpsError('invalid-argument', `Value array has not the expectd length ${length}.`, logger);
        return value.map((element, index) => {
            if (!(this.builder.expectedTypes as Set<BaseTypeName>).has(typeof element))
                throw new HttpsError('invalid-argument', `Array element ${index} has an invalid type: ${typeof element}.`, logger);
            return this.builder.build(element as BaseType<TypeName>, logger.nextIndent);
        });
    }
}
