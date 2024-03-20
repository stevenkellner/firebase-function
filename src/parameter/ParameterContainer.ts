import type { BaseType, BaseTypeName } from './BaseType';
import type { ILogger } from '../logger';
import type { IParameterBuilder } from './parameterBuilder/IParameterBuilder';
import type { IParameterContainer } from './IParameterContainer';
import { HttpsError } from '../utils';

export class ParameterContainer implements IParameterContainer {

    public constructor(
        private readonly data: Record<string, unknown>,
        private readonly logger: ILogger
    ) {
        this.logger.log('ParameterContainer.constructor', { data: data });
    }

    public parameter<TypeName extends BaseTypeName, T>(key: string, builder: IParameterBuilder<TypeName, T>): T {
        this.logger.log('ParameterContainer.parameter', { key: key, expectedTypes: builder.expectedTypes });

        // Throw error if key couldn't be found
        if (!(key in this.data) && !(builder.expectedTypes as Set<BaseTypeName>).has('undefined'))
            throw new HttpsError('invalid-argument', `No ${key} in parameters.`, this.logger);
        const parameter = (this.data as Record<PropertyKey, unknown>)[key];

        // Throw error if type isn't expected
        if (!(builder.expectedTypes as Set<BaseTypeName>).has(typeof parameter))
            throw new HttpsError('invalid-argument', `Parameter ${key} has an invalid type: ${typeof parameter}`, this.logger);

        return builder.build(parameter as BaseType<TypeName>, this.logger.nextIndent);
    }
}
