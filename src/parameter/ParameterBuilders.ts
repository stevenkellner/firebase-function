import { HttpsError } from '../types/HttpsError';
import { type ILogger } from '../logger';
import { type IParameterBuilder } from './IParameterBuilder';
import { type TypeFrom, type TypeOfName } from './TypeOf';

export class ValueParameterBuilder<TypeName extends TypeOfName> implements IParameterBuilder<TypeName, TypeFrom<TypeName>> {
    public constructor(
        private readonly typeName: TypeName
    ) {}

    public get expectedTypes(): TypeName[] {
        return [this.typeName];
    }

    public build(value: TypeFrom<TypeName>, logger: ILogger): TypeFrom<TypeName> {
        logger.log('ValueParameterBuilder.build', { typeName: this.typeName, value: value });
        return value;
    }
}

export class GuardParameterBuilder<TypeName extends TypeOfName, T extends TypeFrom<TypeName>> implements IParameterBuilder<TypeName, T> {
    public constructor(
        private readonly typeName: TypeName,
        private readonly typeGuard: (value: TypeFrom<TypeName>, logger: ILogger) => value is T
    ) {}

    public get expectedTypes(): TypeName[] {
        return [this.typeName];
    }

    public build(value: TypeFrom<TypeName>, logger: ILogger): T {
        logger.log('GuardParameterBuilder.build', { typeName: this.typeName, value: value });
        if (!this.typeGuard(value, logger.nextIndent))
            throw HttpsError('invalid-argument', 'Invalid parameter, type guard failed.', logger);
        return value;
    }
}

export class ParameterBuilder<TypeName extends TypeOfName, T> implements IParameterBuilder<TypeName, T> {
    public constructor(
        private readonly typeName: TypeName,
        private readonly _build: (value: TypeFrom<TypeName>, logger: ILogger) => T
    ) {}

    public get expectedTypes(): TypeName[] {
        return [this.typeName];
    }

    public build(value: TypeFrom<TypeName>, logger: ILogger): T {
        logger.log('ParameterBuilder.build', { typeName: this.typeName, value: value });
        return this._build(value, logger.nextIndent);
    }
}

export class OptionalParameterBuilder<TypeName extends TypeOfName, T> implements IParameterBuilder<TypeName | 'undefined', T | undefined> {
    public constructor(
        private readonly builder: IParameterBuilder<TypeName, T>
    ) {}

    public get expectedTypes(): Array<TypeName | 'undefined'> {
        if ((this.builder.expectedTypes as TypeOfName[]).includes('undefined'))
            return this.builder.expectedTypes;
        return ['undefined', ...this.builder.expectedTypes];
    }

    public build(value: TypeFrom<TypeName | 'undefined'>, logger: ILogger): T | undefined {
        logger.log('OptionalParameterBuilder.build', { expectedTypes: this.builder.expectedTypes, value: value });
        if (typeof value === 'undefined')
            return undefined;
        return this.builder.build(value, logger.nextIndent);
    }
}

export class NullableParameterBuilder<TypeName extends TypeOfName, T> implements IParameterBuilder<TypeName | 'object', T | null> {
    public constructor(
        private readonly builder: IParameterBuilder<TypeName, T>
    ) {}

    public get expectedTypes(): Array<TypeName | 'object'> {
        if ((this.builder.expectedTypes as TypeOfName[]).includes('object'))
            return this.builder.expectedTypes;
        return ['object', ...this.builder.expectedTypes];
    }

    public build(value: TypeFrom<TypeName | 'object'>, logger: ILogger): T | null {
        logger.log('NullableParameterBuilder.build', { expectedTypes: this.builder.expectedTypes, value: value });
        if (value === null)
            return null;
        if (typeof value === 'object' && !(this.builder.expectedTypes as TypeOfName[]).includes('object'))
            throw HttpsError('invalid-argument', 'Value is unexpected an object.', logger);
        return this.builder.build(value as TypeFrom<TypeName>, logger.nextIndent);
    }
}

export class ArrayParameterBuilder<TypeName extends TypeOfName, T> implements IParameterBuilder<'object', T[]> {
    public constructor(
        private readonly builder: IParameterBuilder<TypeName, T>,
        private readonly length?: number
    ) {}

    public get expectedTypes(): Array<'object'> {
        return ['object'];
    }

    public build(value: TypeFrom<'object'>, logger: ILogger): T[] {
        logger.log('ArrayParameterBuilder.build', { expectedTypes: this.builder.expectedTypes, value: value });
        if (value === null || !Array.isArray(value))
            throw HttpsError('invalid-argument', 'Value is not an array.', logger);
        if (this.length !== undefined && value.length !== this.length)
            throw HttpsError('invalid-argument', `Value array has not the expectd length ${length}.`, logger);
        return value.map(element => {
            if (!(this.builder.expectedTypes as TypeOfName[]).includes(typeof element))
                throw HttpsError('invalid-argument', `Array element has an invalid type, expected: ${this.builder.expectedTypes}`, logger);
            return this.builder.build(element as TypeFrom<TypeName>, logger.nextIndent);
        });
    }
}
