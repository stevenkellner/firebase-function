import { type DatabaseType } from '../types/DatabaseType';
import { type ParameterContainer } from './ParameterContainer';

export interface IParameterParser<Parameters extends Record<string, unknown>> {
    readonly parameters: Parameters & { databaseType: DatabaseType };

    parse(container: ParameterContainer): void;
}
