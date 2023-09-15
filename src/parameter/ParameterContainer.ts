import { Crypter } from '../crypter/Crypter';
import { type DatabaseType } from '../DatabaseType';
import { HttpsError } from '../HttpsError';
import { type ILogger } from '../logger';
import { type PrivateKeys } from '../PrivateKeys';
import { type ParameterBuilder } from './ParameterBuilder';
import { type TypeOfName, type TypeFrom } from './TypeOf';

export class ParameterContainer {
    private readonly data: unknown;

    public readonly databaseType: DatabaseType;

    public constructor(data: Record<PropertyKey, unknown> & { databaseType: DatabaseType }, getPrivateKeys: ((databaseType: DatabaseType) => PrivateKeys) | 'uncrypted', logger: ILogger) {
        if (getPrivateKeys === 'uncrypted') {
            this.data = data;
        } else {
            const crypter = new Crypter(getPrivateKeys(data.databaseType).cryptionKeys);

            // Get and decrypt parameters
            if (!('parameters' in data) || typeof data.parameters !== 'string')
                throw HttpsError('invalid-argument', 'Missing parameters in firebase function parameters.', logger);
            this.data = crypter.decryptDecode(data.parameters);
        }
        this.databaseType = data.databaseType;
    }

    public parameter<TypeName extends TypeOfName, T>(key: PropertyKey, builder: ParameterBuilder<TypeName, T>, logger: ILogger): T {
        logger.log('ParameterContainer.parameter', { key: key, expectedTypes: builder.expectedTypes });

        // Throw error if the data is invalid
        if (typeof this.data !== 'object' || this.data === null)
            throw HttpsError('invalid-argument', `Couldn't get ${key.toString()} from invalid parameters.`, logger);

        // Throw error if key couldn't be found
        if (!(key in this.data) && !(builder.expectedTypes as TypeOfName[]).includes('undefined'))
            throw HttpsError('invalid-argument', `No ${key.toString()} in parameters.`, logger);
        const parameter = (this.data as Record<PropertyKey, unknown>)[key];

        // Throw error if type isn't expected
        if (!(builder.expectedTypes as TypeOfName[]).includes(typeof parameter))
            throw HttpsError('invalid-argument', `Parameter ${key.toString()} has an invalid type, expected: ${builder.expectedTypes}, actual: ${typeof parameter}`, logger);

        return builder.build(parameter as TypeFrom<TypeName>, logger.nextIndent);
    }
}
