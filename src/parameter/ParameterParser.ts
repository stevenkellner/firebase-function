import { HttpsError } from '../types';
import type { ILogger } from '../logger';
import type { IParameterBuilders } from './IParameterBuilders';
import type { IParameterContainer } from './IParameterContainer';
import type { IParameterParser } from './IParameterParser';
import { mapRecord } from '../utils';

export class ParameterParser<Parameters extends Record<string, unknown>> implements IParameterParser<Parameters> {

    private initialParameters: Parameters | null = null;

    public constructor(
        private readonly paramterBuilders: IParameterBuilders<Parameters>,
        private readonly logger: ILogger
    ) {}

    public get parameters(): Parameters {
        if (this.initialParameters === null)
            throw HttpsError('internal', 'Tried to access parameters before parameters were parsed.', this.logger);
        return this.initialParameters;
    }

    public parse(container: IParameterContainer): void {
        this.logger.log('ParameterParser.parse', { container: container });
        this.initialParameters = mapRecord(this.paramterBuilders, (builder, key) => container.parameter(key, builder)) as Parameters;
    }
}
