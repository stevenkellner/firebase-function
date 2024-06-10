import * as functions from 'firebase-functions';
import type { BaseType, BaseTypeName } from '../BaseType';
import type { ILogger } from '../../logger';
import type { IParameterBuilder } from './IParameterBuilder';

export class NullableParameterBuilder<TypeName extends BaseTypeName, T> implements IParameterBuilder<TypeName | 'object', T | null> {

    public constructor(
        private readonly builder: IParameterBuilder<TypeName, T>
    ) {}

    public get expectedTypes(): Set<TypeName | 'object'> {
        const expectedTypes = new Set<TypeName | 'object'>(this.builder.expectedTypes);
        expectedTypes.add('object');
        return expectedTypes;
    }

    public build(value: BaseType<TypeName | 'object'>, logger: ILogger): T | null {
        logger.log('NullableParameterBuilder.build', { expectedTypes: this.builder.expectedTypes, value: value });
        if (value === null)
            return null;
        if (typeof value === 'object' && !(this.builder.expectedTypes as Set<BaseTypeName>).has('object'))
            throw new functions.https.HttpsError('invalid-argument', 'Value is unexpected an object.', logger);
        return this.builder.build(value as BaseType<TypeName>, logger.nextIndent);
    }
}
