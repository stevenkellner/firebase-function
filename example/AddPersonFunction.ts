import { type AuthData } from 'firebase-functions/lib/common/providers/https';
import { type DatabaseType, Guid, type IFirebaseFunction, type IFunctionType, type IParameterContainer, type IDatabaseReference, type ILogger, ParameterBuilder, ValueParameterBuilder, ParameterParser } from '../src';
import { type DatabaseScheme } from './DatabaseScheme';

export class AddPersonFunction implements IFirebaseFunction<AddPersonFunctionType> {
    public readonly parameters: IFunctionType.Parameters<AddPersonFunctionType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer,
        private readonly auth: AuthData | null,
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>,
        private readonly logger: ILogger
    ) {
        this.logger.log('AddPersonFunction.constructor', { auth: auth }, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<AddPersonFunctionType>>(
            {
                id: new ParameterBuilder('string', Guid.fromString),
                name: new ValueParameterBuilder('string'),
                age: new ValueParameterBuilder('number')
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<AddPersonFunctionType>> {
        this.logger.log('AddPersonFunction.executeFunction', {}, 'info');
        await this.databaseReference.child('persons').child(this.parameters.id.guidString).set({
            name: this.parameters.name,
            age: this.parameters.age
        }, 'encrypt');
    }
}

export type AddPersonFunctionType = IFunctionType<{
    id: Guid;
    name: string;
    age: number;
}, void, {
    id: string;
    name: string;
    age: number;
}>;
