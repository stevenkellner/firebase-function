import { type DatabaseType, type IDatabaseReference, type IFirebaseFunction, type IFunctionType, type ILogger, type IParameterContainer, ParameterParser } from '../src';
import type { AuthData } from 'firebase-functions/lib/common/providers/https';
import type { DatabaseScheme } from './DatabaseScheme';

export class GetAnimalsFunction implements IFirebaseFunction<GetAnimalsFunctionType> {
    public readonly parameters: IFunctionType.Parameters<GetAnimalsFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer,
        private readonly auth: AuthData | null,
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>,
        private readonly logger: ILogger
    ) {
        this.logger.log('GetAnimalsFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<GetAnimalsFunctionType>>({}, this.logger.nextIndent);
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters as any; // TODO
    }

    public async execute(): Promise<IFunctionType.ReturnType<GetAnimalsFunctionType>> {
        this.logger.log('GetAnimalsFunction.executeFunction', {}, 'info');
        const snapshot = await this.databaseReference.child('animals').snapshot();
        if (!snapshot.exists)
            return [];
        return snapshot.compactMap(snapshot => {
            if (snapshot.key === null)
                return null;
            return {
                id: snapshot.key,
                name: snapshot.child('name').value()
            };
        });
    }
}

export type GetAnimalsFunctionType = IFunctionType<Record<string, never>, { id: string; name: string }[]>;
