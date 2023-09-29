import { type DatabaseType, Guid, type IDatabaseReference, type IFirebaseRequest, type IFunctionType, type ILogger, type IParameterContainer, ParameterBuilder, ParameterParser } from '../src';
import { type DatabaseScheme } from './DatabaseScheme';

export class GetPersonRequest implements IFirebaseRequest<GetPersonRequestType> {
    public readonly parameters: IFunctionType.Parameters<GetPersonRequestType> & { databaseType: DatabaseType };

    public constructor(
        parameterContainer: IParameterContainer,
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>,
        private readonly logger: ILogger
    ) {
        this.logger.log('GetPersonRequest.constructor', undefined, 'notice');
        const parameterParser = new ParameterParser<IFunctionType.Parameters<GetPersonRequestType>>(
            {
                id: new ParameterBuilder('string', Guid.fromString)
            },
            this.logger.nextIndent
        );
        parameterParser.parse(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async execute(): Promise<IFunctionType.ReturnType<GetPersonRequestType>> {
        this.logger.log('GetPersonRequest.executeFunction', {}, 'info');
        const snapshot = await this.databaseReference.child('persons').child(this.parameters.id.guidString).snapshot();
        if (!snapshot.exists)
            return null;
        return {
            ...snapshot.value('decrypt'),
            id: this.parameters.id.guidString
        };
    }
}

export type GetPersonRequestType = IFunctionType<{
    id: Guid;
}, { id: string; name: string; age: number } | null, {
    id: string;
}>;
