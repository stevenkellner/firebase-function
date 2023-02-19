import { HttpsError } from '../HttpsError';
import { type Logger } from '../logger/Logger';
import { type TypeFrom, type TypeOfName } from './TypeOf';

export class ParameterBuilder<TypeName extends TypeOfName, T> {
    public constructor(
        public readonly expectedTypes: TypeName[],
        public readonly build: (value: TypeFrom<TypeName>, logger: Logger) => T
    ) {}
}

export namespace ParameterBuilder {
    export function value<TypeName extends TypeOfName>(typeName: TypeName): ParameterBuilder<TypeName, TypeFrom<TypeName>> {
        return new ParameterBuilder<TypeName, TypeFrom<TypeName>>([typeName], (value: TypeFrom<TypeName>, logger: Logger) => {
            logger.log('ParameterBuilder.value', { typeName: typeName, value: value });
            return value;
        });
    }

    export function guard<TypeName extends TypeOfName, T extends TypeFrom<TypeName>>(typeName: TypeName, typeGuard: (value: TypeFrom<TypeName>, logger: Logger) => value is T): ParameterBuilder<TypeName, T> {
        return new ParameterBuilder<TypeName, T>([typeName], (value: TypeFrom<TypeName>, logger: Logger) => {
            logger.log('ParameterBuilder.guard', { typeName: typeName, value: value });
            if (!typeGuard(value, logger.nextIndent))
                throw HttpsError('invalid-argument', 'Invalid parameter, type guard failed.', logger);
            return value;
        });
    }

    export function build<TypeName extends TypeOfName, T>(typeName: TypeName, build: (value: TypeFrom<TypeName>, logger: Logger) => T): ParameterBuilder<TypeName, T> {
        return new ParameterBuilder<TypeName, T>([typeName], (value: TypeFrom<TypeName>, logger: Logger) => {
            logger.log('ParameterBuilder.build', { typeName: typeName, value: value });
            return build(value, logger.nextIndent);
        });
    }

    export function optional<TypeName extends TypeOfName, T>(builder: ParameterBuilder<TypeName, T>): ParameterBuilder<TypeName | 'undefined', T | undefined> {
        const expectedTypes: Array<TypeName | 'undefined'> = (builder.expectedTypes as TypeOfName[]).includes('undefined') ? builder.expectedTypes : ['undefined', ...builder.expectedTypes];
        return new ParameterBuilder<TypeName | 'undefined', T | undefined>(expectedTypes, (value: TypeFrom<TypeName> | undefined, logger: Logger) => {
            logger.log('ParameterBuilder.optional', { expectedTypes: builder.expectedTypes, value: value });
            if (typeof value === 'undefined')
                return undefined;
            return builder.build(value, logger.nextIndent);
        });
    }
}
