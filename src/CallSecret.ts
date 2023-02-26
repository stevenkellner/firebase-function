import { Crypter } from './crypter';
import { HttpsError } from './HttpsError';
import { type ILogger } from './logger';

export interface CallSecret {
    expiresAt: Date;
    hashedData: string;
}

export namespace CallSecret {
    export interface Flatten {
        expiresAt: string;
        hashedData: string;
    }

    export function fromObject(value: object | null, logger: ILogger): CallSecret {
        logger.log('CallSecret.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get call secret from null.', logger);

        if (!('expiresAt' in value) || typeof value.expiresAt !== 'string')
            throw HttpsError('internal', 'Couldn\'t get expiresAt for call secret.', logger);

        if (!('hashedData' in value) || typeof value.hashedData !== 'string')
            throw HttpsError('internal', 'Couldn\'t get hashed data for call secret.', logger);

        return {
            expiresAt: new Date(value.expiresAt),
            hashedData: value.hashedData
        };
    }

    export function checkCallSecret(callSecret: CallSecret, callSecretKey: string, logger: ILogger) {
        const actualHashedData = Crypter.sha512(callSecret.expiresAt.toISOString(), callSecretKey);
        if (callSecret.hashedData !== actualHashedData)
            throw HttpsError('permission-denied', 'Call secret is rejected, since the hashed data is invalid.', logger);
        if (new Date() > callSecret.expiresAt)
            throw HttpsError('permission-denied', 'Call secret is rejected, since it is expired.', logger);
    }
}
