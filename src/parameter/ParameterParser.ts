import type { ILogger } from '../logger';
import type { IParameterBuilders } from './IParameterBuilders';
import type { IParameterContainer } from './IParameterContainer';
import type { IParameterParser } from './IParameterParser';
import { mapRecord } from '../utils';

export class ParameterParser<Parameters extends Record<string, unknown>> implements IParameterParser<Parameters> {

    public constructor(
        private readonly paramterBuilders: IParameterBuilders<Parameters>,
        private readonly logger: ILogger
    ) {}

    public parse(container: IParameterContainer): Parameters {
        this.logger.log('ParameterParser.parse', { container: container });
        return mapRecord(this.paramterBuilders, (builder, key) => container.parameter(key, builder)) as Parameters;
    }
}
