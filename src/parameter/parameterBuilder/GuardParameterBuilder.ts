import type { BaseType, BaseTypeName } from '../BaseType';
import { HttpsError } from '../../types';
import type { ILogger } from '../../logger';
import type { IParameterBuilder } from './IParameterBuilder';

export class GuardParameterBuilder<TypeName extends BaseTypeName, T extends BaseType<TypeName>> implements IParameterBuilder<TypeName, T> {
    public constructor(
        private readonly typeName: TypeName,
        private readonly typeGuard: (value: BaseType<TypeName>, logger: ILogger) => value is T
    ) {}

    public get expectedTypes(): Set<TypeName> {
        return new Set([this.typeName]);
    }

    public build(value: BaseType<TypeName>, logger: ILogger): T {
        logger.log('GuardParameterBuilder.build', { typeName: this.typeName, value: value });
        if (!this.typeGuard(value, logger.nextIndent))
            throw HttpsError('invalid-argument', 'Invalid parameter, type guard failed.', logger);
        return value;
    }
}
