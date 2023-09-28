import { type ICrypter } from '../crypter';
import { type DatabaseType } from '../types/DatabaseType';
import { HttpsError } from '../types/HttpsError';
import { type ILogger } from '../logger';
import { type IParameterBuilder } from './IParameterBuilder';
import { type IParameterContainer } from './IParameterContainer';
import { type TypeOfName, type TypeFrom } from './TypeOf';

export class ParameterContainer implements IParameterContainer {
    private readonly data: unknown;

    public readonly databaseType: DatabaseType;

    public constructor(
        data: Record<PropertyKey, unknown> & { databaseType: DatabaseType },
        crypter: ICrypter | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('ParameterContainer.constructor', { data: data });
        if (crypter === null) {
            this.data = data;
        } else {
            if (!('parameters' in data) || typeof data.parameters !== 'string')
                throw HttpsError('invalid-argument', 'Missing parameters in firebase function parameters.', this.logger);
            this.data = crypter.decryptDecode(data.parameters);
        }
        this.databaseType = data.databaseType;
    }

    public parameter<TypeName extends TypeOfName, T>(key: PropertyKey, builder: IParameterBuilder<TypeName, T>): T {
        this.logger.log('ParameterContainer.parameter', { key: key, expectedTypes: builder.expectedTypes });

        // Throw error if the data is invalid
        if (typeof this.data !== 'object' || this.data === null)
            throw HttpsError('invalid-argument', `Couldn't get ${key.toString()} from invalid parameters.`, this.logger);

        // Throw error if key couldn't be found
        if (!(key in this.data) && !(builder.expectedTypes as TypeOfName[]).includes('undefined'))
            throw HttpsError('invalid-argument', `No ${key.toString()} in parameters.`, this.logger);
        const parameter = (this.data as Record<PropertyKey, unknown>)[key];

        // Throw error if type isn't expected
        if (!(builder.expectedTypes as TypeOfName[]).includes(typeof parameter))
            throw HttpsError('invalid-argument', `Parameter ${key.toString()} has an invalid type, expected: ${builder.expectedTypes}, actual: ${typeof parameter}`, this.logger);

        return builder.build(parameter as TypeFrom<TypeName>, this.logger.nextIndent);
    }
}
