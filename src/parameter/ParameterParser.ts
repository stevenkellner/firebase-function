import { type DatabaseType } from '../DatabaseType';
import { HttpsError } from '../HttpsError';
import { type ILogger } from '../logger';
import { type ParameterBuilder } from './ParameterBuilder';
import { type ParameterContainer } from './ParameterContainer';
import { type TypeOfName } from './TypeOf';

export type ParameterBuilders<Parameters extends Record<string, unknown>> = {
    [Key in keyof Parameters]: ParameterBuilder<TypeOfName, Parameters[Key]>
};

export class ParameterParser<Parameters extends Record<string, unknown>> {
    private initialParameters?: Parameters & { databaseType: DatabaseType };

    public constructor(
        private readonly paramterBuilders: ParameterBuilders<Parameters>,
        private readonly logger: ILogger
    ) {}

    public get parameters(): Parameters & { databaseType: DatabaseType } {
        if (this.initialParameters === undefined)
            throw HttpsError('internal', 'Tried to access parameters before those parameters were parsed.', this.logger);
        return this.initialParameters;
    }

    public parseParameters(container: ParameterContainer): void {
        this.logger.log('ParameterParser.parseParameters', { container: container });
        this.initialParameters = {} as Parameters & { databaseType: DatabaseType };
        for (const entry of Object.entries(this.paramterBuilders))
            this.initialParameters[entry[0] as keyof Parameters] = container.parameter(entry[0], entry[1], this.logger.nextIndent);
        this.initialParameters.databaseType = container.databaseType;
    }
}
