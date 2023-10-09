import type { DatabaseType } from '../types/DatabaseType';
import { HttpsError } from '../types/HttpsError';
import type { ILogger } from '../logger';
import type { IParameterBuilders } from './IParameterBuilder';
import type { IParameterContainer } from './IParameterContainer';
import type { IParameterParser } from './IParameterParser';

export class ParameterParser<Parameters extends Record<string, unknown>> implements IParameterParser<Parameters> {
    private initialParameters: Parameters & { databaseType: DatabaseType } | null = null;

    public constructor(
        private readonly paramterBuilders: IParameterBuilders<Parameters>,
        private readonly logger: ILogger
    ) {}

    public get parameters(): Parameters & { databaseType: DatabaseType } {
        if (this.initialParameters === null)
            throw HttpsError('internal', 'Tried to access parameters before those parameters were parsed.', this.logger);
        return this.initialParameters;
    }

    public parse(container: IParameterContainer): void {
        this.logger.log('ParameterParser.parseParameters', { container: container });
        this.initialParameters = {} as Parameters & { databaseType: DatabaseType };
        for (const entry of Object.entries(this.paramterBuilders))
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            this.initialParameters[entry[0] as keyof Parameters] = container.parameter(entry[0], entry[1]);
        this.initialParameters.databaseType = container.databaseType;
    }
}
