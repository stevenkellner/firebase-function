import type { DatabaseType } from '../types/DatabaseType';
import type { IParameterBuilder } from './IParameterBuilder';
import type { TypeOfName } from './TypeOf';

export interface IParameterContainer {
    readonly databaseType: DatabaseType;

    parameter<TypeName extends TypeOfName, T>(key: PropertyKey, builder: IParameterBuilder<TypeName, T>): T;
}
