import { httpsCallable, type Functions } from 'firebase/functions';
import { type CallSecret } from '../CallSecret';
import { Crypter } from '../crypter';
import { DatabaseType } from '../DatabaseType';
import { type FirebaseFunction } from '../FirebaseFunction';
import { type FunctionType } from '../FunctionType';
import { type FirebaseFunctionDescriptor, type FirebaseFunctionsType } from '../FirebaseFunctionsType';
import { type ValidReturnType } from '../ValidReturnType';
import { type VerboseType } from '../logger';
import { type ExpectResult, expectResult } from './Expect';

export class FirebaseFunctions<FFunctions extends FirebaseFunctionsType> {
    public constructor(
        private readonly functions: Functions,
        private readonly cryptionKeys: Crypter.Keys,
        private readonly callSecretKey: string,
        private readonly functionName?: string
    ) {}

    public function<Key extends (FFunctions extends FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>> ? never : (keyof FFunctions & string))>(key: Key): FirebaseFunctions<FFunctions extends FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>> ? never : FFunctions[Key]> {
        return new FirebaseFunctions(this.functions, this.cryptionKeys, this.callSecretKey, this.functionName === undefined ? key : `${this.functionName}-${key}`);
    }

    public async call(parameters: FFunctions extends FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>> ? FirebaseFunctionDescriptor.FlattenParameters<FFunctions> : never): Promise<ExpectResult<FFunctions extends FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>> ? FirebaseFunctionDescriptor.ReturnType<FFunctions> : never>> {
        const databaseType = new DatabaseType('testing');
        const crypter = new Crypter(this.cryptionKeys);
        const expiresAtIsoDate = new Date(new Date().getTime() + 60000).toISOString();
        const callableFunction = httpsCallable<{
            verbose: VerboseType.Value;
            databaseType: DatabaseType.Value;
            callSecret: CallSecret;
            parameters: string;
        }, string>(this.functions, this.functionName ?? '');
        const httpsCallableResult = await callableFunction({
            verbose: 'coloredVerbose',
            databaseType: databaseType.value,
            callSecret: {
                expiresAt: expiresAtIsoDate,
                hashedData: Crypter.sha512(expiresAtIsoDate, this.callSecretKey)
            },
            parameters: crypter.encodeEncrypt(parameters)
        });
        const result: FirebaseFunction.Result<FFunctions extends FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>> ? FirebaseFunctionDescriptor.ReturnType<FFunctions> : never> = await crypter.decryptDecode(httpsCallableResult.data);
        return expectResult(result);
    }
}
