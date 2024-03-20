import { type ExpectResult, expectResult } from './Expect';
import type { FirebaseError, FirebaseResult, IFunctionType } from '../../src/types';
import { type Functions, httpsCallable } from 'firebase/functions';
import type { CallSecret } from '../../src/types/CallSecret';
import { DatabaseType } from '../../src/types/DatabaseType';
import type { FirebaseDescriptor } from '../../src/FirebaseDescriptor';
import type { FirebaseFunctions as FirebaseFunctionsType } from '../../src/FirebaseFunctions';
import type { IDatabaseScheme } from '../../src/database';
import { Result } from '../../src/types/Result';
import { Sha512 } from '../../src';
import { UtcDate } from '../../src/types/UtcDate';
import { encodeURL } from 'js-base64';
import fetch from 'cross-fetch';

export class FirebaseFunctions<FFunctions extends FirebaseFunctionsType<DatabaseScheme>, DatabaseScheme extends IDatabaseScheme> {
    public constructor(
        private readonly functions: Functions,
        private readonly requestUrlComponent: string,
        private readonly callSecretKey: string,
        private readonly functionName: string | null = null
    ) {}

    public function<Key extends FirebaseFunctions.KeyIfRecord<FFunctions, DatabaseScheme>>(key: Key): FirebaseFunctions<FirebaseFunctions.FFunctionIfRecord<FFunctions, Key, DatabaseScheme>, DatabaseScheme> {
        return new FirebaseFunctions(this.functions, this.requestUrlComponent, this.callSecretKey, this.functionName === null ? key : `${this.functionName}-${key}`);
    }

    public async call(parameters: FirebaseFunctions.ParametersIfFunction<FFunctions, DatabaseScheme>): Promise<ExpectResult<FirebaseFunctions.ReturnTypeIfFunction<FFunctions, DatabaseScheme>>> {
        const databaseType = new DatabaseType('testing');
        const expiresAtUtcDate = UtcDate.now.advanced({ minute: 1 });
        const functionName = this.functionName === null ? '' : `debug-${this.functionName}`;
        const callableFunction = httpsCallable<{
            verbose: boolean;
            databaseType: DatabaseType.Value;
            callSecret: CallSecret;
            parameters: string;
        }, {
            result: string;
            context: unknown;
        }>(this.functions, functionName);
        const httpsCallableResult = await callableFunction({
            verbose: true,
            databaseType: databaseType.value,
            callSecret: {
                expiresAt: expiresAtUtcDate.encoded,
                hashedData: new Sha512().hash(expiresAtUtcDate.encoded, this.callSecretKey)
            },
            parameters: parameters as string
        });
        const result: FirebaseResult<FirebaseFunctions.ReturnTypeIfFunction<FFunctions, DatabaseScheme>> = httpsCallableResult.data.result as any;
        return expectResult(result);
    }

    public async request(parameters: FirebaseFunctions.ParametersIfRequest<FFunctions, DatabaseScheme>): Promise<ExpectResult<FirebaseFunctions.ReturnTypeIfRequest<FFunctions, DatabaseScheme>>> {
        const functionName = this.functionName === null ? '' : `debug-${this.functionName}`;
        const baseUrl = `https://${this.requestUrlComponent}.cloudfunctions.net/${functionName}`;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-template-expressions
        const joinedParameters = [...Object.entries(parameters as any), ['databaseType', 'testing'] as const].map(parameter => `${parameter[0]}=${parameter[1]}`).join('&');
        const url = encodeURL(`${baseUrl}?${joinedParameters}`);
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
            const response: FirebaseFunctions.ReturnTypeIfRequest<FFunctions, DatabaseScheme> = JSON.parse(await (await fetch(url)).json());
            return expectResult(Result.success(response));
        } catch (error) {
            return expectResult(Result.failure(error as FirebaseError));
        }
    }
}

namespace FirebaseFunctions {
    export type KeyIfRecord<FFunctions extends FirebaseFunctionsType<DatabaseScheme>, DatabaseScheme extends IDatabaseScheme> = (FFunctions extends Record<string, FirebaseFunctionsType<DatabaseScheme>> ? (keyof FFunctions & string) : never);
    export type FFunctionIfRecord<FFunctions extends FirebaseFunctionsType<DatabaseScheme>, Key extends keyof FFunctions, DatabaseScheme extends IDatabaseScheme> = FFunctions extends Record<string, FirebaseFunctionsType<DatabaseScheme>> ? FFunctions[Key] : never;

    export type ParametersIfFunction<FFunctions extends FirebaseFunctionsType<DatabaseScheme>, DatabaseScheme extends IDatabaseScheme> = FFunctions extends FirebaseDescriptor.Function<infer FunctionType, unknown, DatabaseScheme> ? IFunctionType.FlattenParameters<FunctionType> : never;
    export type ReturnTypeIfFunction<FFunctions extends FirebaseFunctionsType<DatabaseScheme>, DatabaseScheme extends IDatabaseScheme> = FFunctions extends FirebaseDescriptor.Function<infer FunctionType, unknown, DatabaseScheme> ? IFunctionType.ReturnType<FunctionType> : never;

    export type ParametersIfRequest<FFunctions extends FirebaseFunctionsType<DatabaseScheme>, DatabaseScheme extends IDatabaseScheme> = FFunctions extends FirebaseDescriptor.Request<infer FunctionType, DatabaseScheme> ? IFunctionType.FlattenParameters<FunctionType> : never;
    export type ReturnTypeIfRequest<FFunctions extends FirebaseFunctionsType<DatabaseScheme>, DatabaseScheme extends IDatabaseScheme> = FFunctions extends FirebaseDescriptor.Request<infer FunctionType, DatabaseScheme> ? IFunctionType.ReturnType<FunctionType> : never;
}
