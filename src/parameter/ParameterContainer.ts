import { Crypter } from '../crypter/Crypter';
import { DatabaseType } from '../DatabaseType';
import { HttpsError } from '../HttpsError';
import { type Logger } from '../logger/Logger';
import { type ParameterBuilder } from './ParameterBuilder';
import { type TypeOfName, type TypeFrom } from './TypeOf';

export class ParameterContainer {
    private readonly data: unknown;

    public constructor(data: unknown, getCryptionKeys: (databaseType: DatabaseType) => Crypter.Keys, logger: Logger) {
        logger.log('ParameterContainer.constructor', { data: data });

        // Check if parameters are hand over
        if (data === undefined || data === null || typeof data !== 'object')
            throw HttpsError('invalid-argument', 'No parameters hand over by the firebase function.', logger);

        // Check if database type is valid
        if (!('databaseType' in data) || typeof data.databaseType !== 'string')
            throw HttpsError('invalid-argument', 'Missing database type in firebase function parameters.', logger);

        const databaseType = DatabaseType.fromString(data.databaseType, logger.nextIndent);
        const crypter = new Crypter(getCryptionKeys(databaseType));

        // Get and decrypt parameters
        if (!('parameters' in data) || typeof data.parameters !== 'string')
            throw HttpsError('invalid-argument', 'Missing parameters in firebase function parameters.', logger);
        this.data = crypter.decryptDecode(data.parameters);
    }

    public optionalParameter<TypeName extends TypeOfName, T>(key: PropertyKey, builder: ParameterBuilder<TypeName, T>, logger: Logger): T | undefined {
        logger.log('ParameterContainer.optionalParameter', { key: key, expectedTypes: builder.expectedTypes });

        // Return undefined if the parameter doesn't exist
        if (this.data === undefined || this.data === null || typeof this.data !== 'object' || !(key in this.data))
            return undefined;

        // Get the parameter from the firebase function data
        const parameter = (this.data as Record<PropertyKey, unknown>)[key];

        // Return undefined if the parameter is undefined or null
        if (parameter === undefined || parameter === null)
            return undefined;

        // Check expected type
        if (!(builder.expectedTypes as TypeOfName[]).includes(typeof parameter))
            throw HttpsError('invalid-argument', `Parameter ${key.toString()} has a invalid type, expected: ${builder.expectedTypes}`, logger);

        // Build and return parameter
        return builder.build(parameter as TypeFrom<TypeName>, logger.nextIndent);
    }

    public parameter<TypeName extends TypeOfName, T>(key: PropertyKey, builder: ParameterBuilder<TypeName, T>, logger: Logger): T {
        logger.log('ParameterContainer.parameter', { key: key, expectedTypes: builder.expectedTypes });

        // Get parameter that is possible optional
        const parameter = this.optionalParameter(key, builder, logger.nextIndent);

        // Check if the parameter is undefined
        if (parameter === undefined) {
            if (!(builder.expectedTypes as TypeOfName[]).includes('undefined'))
                throw HttpsError('invalid-argument', `Parameter ${key.toString()} cannot be undefined.`, logger);
            return builder.build(parameter as undefined as TypeFrom<TypeName>, logger.nextIndent);
        }

        // Return parameter
        return parameter;
    }
}
