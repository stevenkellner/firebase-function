import { httpsCallable, type Functions } from 'firebase/functions';
import { type CallSecret } from '../types/CallSecret';
import { Crypter, sha512 } from '../crypter';
import { DatabaseType } from '../types/DatabaseType';
import { type FirebaseFunctions as FirebaseFunctionsType } from '../FirebaseFunctions';
import { type ValidReturnType } from '../types/ValidReturnType';
import { type VerboseType } from '../logger';
import { type ExpectResult, expectResult } from './Expect';
import { UtcDate } from '../types/UtcDate';
import { encodeURL } from 'js-base64';
import fetch from 'cross-fetch';
import { Result } from '../types/Result';
import { type IFunctionType, type FirebaseError, type FirebaseResult } from '../types';
import { type FirebaseDescriptor } from '../FirebaseDescriptor';

export class FirebaseFunctions<FFunctions extends FirebaseFunctionsType> {
    public constructor(
        private readonly functions: Functions,
        private readonly requestUrlComponent: string,
        private readonly cryptionKeys: Crypter.Keys,
        private readonly callSecretKey: string,
        private readonly functionName?: string
    ) {}

    public function<Key extends FirebaseFunctions.KeyIfRecord<FFunctions>>(key: Key): FirebaseFunctions<FirebaseFunctions.FFunctionIfRecord<FFunctions, Key>> {
        return new FirebaseFunctions(this.functions, this.requestUrlComponent, this.cryptionKeys, this.callSecretKey, this.functionName === undefined ? key : `${this.functionName}-${key}`);
    }

    public async call(parameters: FirebaseFunctions.ParametersIfFunction<FFunctions>): Promise<ExpectResult<FirebaseFunctions.ReturnTypeIfFunction<FFunctions>>> {
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
        const result: FirebaseResult<FirebaseFunctions.ReturnTypeIfFunction<FFunctions>> = await crypter.decryptDecode(httpsCallableResult.data.result);
        return expectResult(result);
    }

    public async request(parameters: FirebaseFunctions.ParametersIfRequest<FFunctions>): Promise<ExpectResult<FirebaseFunctions.ReturnTypeIfRequest<FFunctions>>> {
        const functionName = this.functionName !== undefined ? `debug-${this.functionName}` : '';
        const baseUrl = `https://${this.requestUrlComponent}.cloudfunctions.net/${functionName}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const joinedParameters = [...Object.entries(parameters as any), ['databaseType', 'testing'] as const].map(parameter => `${parameter[0]}=${parameter[1]}`).join('&');
        const url = encodeURL(`${baseUrl}?${joinedParameters}`);
        try {
            const response: FirebaseFunctions.ReturnTypeIfRequest<FFunctions> = JSON.parse(await (await fetch(url)).json());
            return expectResult(Result.success(response));
        } catch (error) {
            return expectResult(Result.failure(error as FirebaseError));
        }
    }
}

namespace FirebaseFunctions {
    export type KeyIfRecord<FFunctions extends FirebaseFunctionsType> = (FFunctions extends Record<string, FirebaseFunctionsType> ? (keyof FFunctions & string) : never);
    export type FFunctionIfRecord<FFunctions extends FirebaseFunctionsType, Key extends keyof FFunctions> = FFunctions extends Record<string, FirebaseFunctionsType> ? FFunctions[Key] : never;

    export type ParametersIfFunction<FFunctions extends FirebaseFunctionsType> = FFunctions extends FirebaseDescriptor.Function<IFunctionType<unknown, ValidReturnType, infer FlattenParameters>, unknown> ? FlattenParameters : never;
    export type ReturnTypeIfFunction<FFunctions extends FirebaseFunctionsType> = FFunctions extends FirebaseDescriptor.Function<IFunctionType<unknown, infer ReturnType, unknown>, unknown> ? ReturnType : never;

    export type ParametersIfRequest<FFunctions extends FirebaseFunctionsType> = FFunctions extends FirebaseDescriptor.Request<IFunctionType<unknown, ValidReturnType, infer FlattenParameters>> ? FlattenParameters : never;
    export type ReturnTypeIfRequest<FFunctions extends FirebaseFunctionsType> = FFunctions extends FirebaseDescriptor.Request<IFunctionType<unknown, infer ReturnType, unknown>> ? ReturnType : never;
}
