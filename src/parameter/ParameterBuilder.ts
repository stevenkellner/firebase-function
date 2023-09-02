import { HttpsError } from '../HttpsError';
import { type ILogger } from '../logger';
import { type TypeFrom, type TypeOfName } from './TypeOf';

export class ParameterBuilder<TypeName extends TypeOfName, T> {
    public constructor(
        public readonly expectedTypes: TypeName[],
        public readonly build: (value: TypeFrom<TypeName>, logger: ILogger) => T
    ) {}
}

export namespace ParameterBuilder {
    export function value<TypeName extends TypeOfName>(typeName: TypeName): ParameterBuilder<TypeName, TypeFrom<TypeName>> {
        return new ParameterBuilder<TypeName, TypeFrom<TypeName>>([typeName], (value: TypeFrom<TypeName>, logger: ILogger) => {
            logger.log('ParameterBuilder.value', { typeName: typeName, value: value });
            return value;
        });
    }

    export function guard<TypeName extends TypeOfName, T extends TypeFrom<TypeName>>(typeName: TypeName, typeGuard: (value: TypeFrom<TypeName>, logger: ILogger) => value is T): ParameterBuilder<TypeName, T> {
        return new ParameterBuilder<TypeName, T>([typeName], (value: TypeFrom<TypeName>, logger: ILogger) => {
            logger.log('ParameterBuilder.guard', { typeName: typeName, value: value });
            if (!typeGuard(value, logger.nextIndent))
                throw HttpsError('invalid-argument', 'Invalid parameter, type guard failed.', logger);
            return value;
        });
    }

    export function build<TypeName extends TypeOfName, T>(typeName: TypeName, build: (value: TypeFrom<TypeName>, logger: ILogger) => T): ParameterBuilder<TypeName, T> {
        return new ParameterBuilder<TypeName, T>([typeName], (value: TypeFrom<TypeName>, logger: ILogger) => {
            logger.log('ParameterBuilder.build', { typeName: typeName, value: value });
            return build(value, logger.nextIndent);
        });
    }

    export function optional<TypeName extends TypeOfName, T>(builder: ParameterBuilder<TypeName, T>): ParameterBuilder<TypeName | 'undefined', T | undefined> {
        const expectedTypes: Array<TypeName | 'undefined'> = (builder.expectedTypes as TypeOfName[]).includes('undefined') ? builder.expectedTypes : ['undefined', ...builder.expectedTypes];
        return new ParameterBuilder<TypeName | 'undefined', T | undefined>(expectedTypes, (value: TypeFrom<TypeName> | undefined, logger: ILogger) => {
            logger.log('ParameterBuilder.optional', { expectedTypes: builder.expectedTypes, value: value });
            if (typeof value === 'undefined')
                return undefined;
            return builder.build(value, logger.nextIndent);
        });
    }

    export function nullable<TypeName extends TypeOfName, T>(builder: ParameterBuilder<TypeName, T>): ParameterBuilder<TypeName | 'object', T | null> {
        const expectedTypes: Array<TypeName | 'object'> = (builder.expectedTypes as TypeOfName[]).includes('object') ? builder.expectedTypes : ['object', ...builder.expectedTypes];
        return new ParameterBuilder<TypeName | 'object', T | null>(expectedTypes, (value: TypeFrom<TypeName> | object | null, logger: ILogger) => {
            logger.log('ParameterBuilder.nullable', { expectedTypes: builder.expectedTypes, value: value });
            if (value === null)
                return null;
            if (typeof value === 'object' && !(builder.expectedTypes as TypeOfName[]).includes('object'))
                throw HttpsError('invalid-argument', `Type of value is object, but expected null or ${builder.expectedTypes}`, logger);
            return builder.build(value as TypeFrom<TypeName>, logger.nextIndent);
        });
    }

    export function array<TypeName extends TypeOfName, T>(builder: ParameterBuilder<TypeName, T>, length?: number): ParameterBuilder<'object', T[]> {
        return new ParameterBuilder<'object', T[]>(['object'], (value: object | null, logger: ILogger) => {
            logger.log('ParameterBuilder.array', { expectedTypes: builder.expectedTypes, value: value });
            if (value === null || !Array.isArray(value))
                throw HttpsError('invalid-argument', 'Value is not an array.', logger);
            if (length !== undefined && value.length !== length)
                throw HttpsError('invalid-argument', `Value array has not the expectd length ${length}.`, logger);
            return value.map(element => {
                if (!(builder.expectedTypes as TypeOfName[]).includes(typeof element))
                    throw HttpsError('invalid-argument', `Array element has an invalid type, expected: ${builder.expectedTypes}`, logger);
                return builder.build(element as TypeFrom<TypeName>, logger.nextIndent);
            });
        });
    }
}
