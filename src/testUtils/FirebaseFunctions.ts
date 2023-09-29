import { httpsCallable, type Functions } from 'firebase/functions';
import { type CallSecret } from '../types/CallSecret';
import { Crypter, sha512 } from '../crypter';
import { DatabaseType } from '../types/DatabaseType';
import { type FirebaseFunctions as FirebaseFunctionsType } from '../FirebaseFunctions';
import { type VerboseType } from '../logger';
import { type ExpectResult, expectResult } from './Expect';
import { UtcDate } from '../types/UtcDate';
import { encodeURL } from 'js-base64';
import fetch from 'cross-fetch';
import { Result } from '../types/Result';
import { type IFunctionType, type FirebaseError, type FirebaseResult } from '../types';
import { type FirebaseDescriptor } from '../FirebaseDescriptor';
import { type IDatabaseScheme } from '../database';

export class FirebaseFunctions<FFunctions extends FirebaseFunctionsType<DatabaseScheme>, DatabaseScheme extends IDatabaseScheme> {
    public constructor(
        private readonly functions: Functions,
        private readonly requestUrlComponent: string,
        private readonly cryptionKeys: Crypter.Keys,
        private readonly callSecretKey: string,
        private readonly functionName?: string
    ) {}

    public function<Key extends FirebaseFunctions.KeyIfRecord<FFunctions, DatabaseScheme>>(key: Key): FirebaseFunctions<FirebaseFunctions.FFunctionIfRecord<FFunctions, Key, DatabaseScheme>, DatabaseScheme> {
        return new FirebaseFunctions(this.functions, this.requestUrlComponent, this.cryptionKeys, this.callSecretKey, this.functionName === undefined ? key : `${this.functionName}-${key}`);
    }

    public async call(parameters: FirebaseFunctions.ParametersIfFunction<FFunctions, DatabaseScheme>): Promise<ExpectResult<FirebaseFunctions.ReturnTypeIfFunction<FFunctions, DatabaseScheme>>> {
        const databaseType = new DatabaseType('testing');
        const crypter = new Crypter(this.cryptionKeys);
        const expiresAtUtcDate = UtcDate.now.advanced({ minute: 1 });
        const functionName = this.functionName !== undefined ? `debug-${this.functionName}` : '';
        const callableFunction = httpsCallable<{
            verbose: VerboseType.Value;
            databaseType: DatabaseType.Value;
            callSecret: CallSecret;
            parameters: string;
        }, {
            result: string;
            context: unknown;
        }>(this.functions, functionName);
        const httpsCallableResult = await callableFunction({
            verbose: 'coloredVerbose',
            databaseType: databaseType.value,
            callSecret: {
                expiresAt: expiresAtUtcDate.encoded,
                hashedData: sha512(expiresAtUtcDate.encoded, this.callSecretKey)
            },
            parameters: crypter.encodeEncrypt(parameters)
        });
        const result: FirebaseResult<FirebaseFunctions.ReturnTypeIfFunction<FFunctions, DatabaseScheme>> = await crypter.decryptDecode(httpsCallableResult.data.result);
        return expectResult(result);
    }

    public async request(parameters: FirebaseFunctions.ParametersIfRequest<FFunctions, DatabaseScheme>): Promise<ExpectResult<FirebaseFunctions.ReturnTypeIfRequest<FFunctions, DatabaseScheme>>> {
        const functionName = this.functionName !== undefined ? `debug-${this.functionName}` : '';
        const baseUrl = `https://${this.requestUrlComponent}.cloudfunctions.net/${functionName}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const joinedParameters = [...Object.entries(parameters as any), ['databaseType', 'testing'] as const].map(parameter => `${parameter[0]}=${parameter[1]}`).join('&');
        const url = encodeURL(`${baseUrl}?${joinedParameters}`);
        try {
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
