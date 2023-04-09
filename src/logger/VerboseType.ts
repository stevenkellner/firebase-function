import { type DatabaseType } from '../DatabaseType';
import { HttpsError } from '../HttpsError';
import { type ILogger } from './ILogger';

export class VerboseType {
    public constructor(
        private readonly value: VerboseType.Value
    ) {}

    public get isVerbose(): boolean {
        return this.value === 'verbose' || this.value === 'coloredVerbose';
    }

    public get isColored(): boolean {
        return this.value === 'colored' || this.value === 'coloredVerbose';
    }
}

export namespace VerboseType {
    export type Value = 'none' | 'verbose' | 'colored' | 'coloredVerbose';

    export function fromString(value: string, databaseType: DatabaseType, logger: ILogger): VerboseType {
        logger.log('VerboseType.fromObject', { value: value, databaseType: databaseType });

        if (value !== 'none' && value !== 'verbose' && value !== 'colored' && value !== 'coloredVerbose')
            throw HttpsError('internal', `Couldn't get verbose type from ${value}.`, logger);

        if (databaseType.value === 'release' && value === 'verbose')
            return new VerboseType('none');
        else if (databaseType.value === 'release' && value === 'coloredVerbose')
            return new VerboseType('colored');

        return new VerboseType(value);
    }
}
