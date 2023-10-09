import { HttpsError } from './HttpsError';
import type { ILogger } from '../logger';
import { UtcDate } from './UtcDate';
import { sha512 } from '../crypter';

export interface CallSecret {
    expiresAt: string;
    hashedData: string;
}

export namespace CallSecret {
    export function fromObject(value: object | null, logger: ILogger): CallSecret {
        logger.log('CallSecret.fromObject', { value: value });

        if (value === null)
            throw HttpsError('internal', 'Couldn\'t get call secret from null.', logger);

        if (!('expiresAt' in value) || typeof value.expiresAt !== 'string')
            throw HttpsError('internal', 'Couldn\'t get expiresAt for call secret.', logger);

        if (!('hashedData' in value) || typeof value.hashedData !== 'string')
            throw HttpsError('internal', 'Couldn\'t get hashed data for call secret.', logger);

        return {
            expiresAt: value.expiresAt,
            hashedData: value.hashedData
        };
    }

    export function checkCallSecret(callSecret: CallSecret, callSecretKey: string, logger: ILogger): void {
        const actualHashedData = sha512(callSecret.expiresAt, callSecretKey);
        if (callSecret.hashedData !== actualHashedData)
            throw HttpsError('permission-denied', 'Call secret is rejected, since the hashed data is invalid.', logger);
        if (UtcDate.decode(callSecret.expiresAt).compare(UtcDate.now) === 'less')
            throw HttpsError('permission-denied', 'Call secret is rejected, since it is expired.', logger);
    }
}
