import { HttpsError } from './HttpsError';
import { type Logger } from './logger/Logger';

export class DatabaseType {
    public constructor(
        public readonly value: DatabaseType.Value
    ) {}
}

export namespace DatabaseType {
    export type Value = 'release' | 'debug' | 'testing';

    export function fromString(value: string, logger: Logger): DatabaseType {
        logger.log('DatabaseType.fromString', { value: value });
        if (value !== 'release' && value !== 'debug' && value !== 'testing')
            throw HttpsError('internal', `Couldn't parse DatabaseType, got ${value}.`, logger);
        return new DatabaseType(value);
    }
}
