import type { ParameterContainer } from './ParameterContainer';

export interface IParameterParser<Parameters extends Record<string, unknown>> {

    parse(container: ParameterContainer): Parameters;
}
