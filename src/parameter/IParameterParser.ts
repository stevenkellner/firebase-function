import type { ParameterContainer } from './ParameterContainer';

export interface IParameterParser<Parameters extends Record<string, unknown>> {

    readonly parameters: Parameters;

    parse(container: ParameterContainer): void;
}
