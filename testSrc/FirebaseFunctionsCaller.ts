import { connectFunctionsEmulator, httpsCallable, type Functions as FunctionsInstance, getFunctions } from 'firebase/functions';
import { HexBytesCoder, HMAC, Result, Utf8BytesCoder, type FirebaseFunctions } from '../src';
import axios from 'axios';
import type { FirebaseApp } from './FirebaseApp';

export class FirebaseFunctionsCaller<Functions extends FirebaseFunctions> {

    public constructor(
        private readonly functions: Functions,
        private readonly options: FirebaseApp.Options,
        private readonly name: string = ''
    ) {}

    public function<Key extends FirebaseFunctions.IsRecord<FirebaseFunctions> extends true ? keyof FirebaseFunctions : never>(
        key: Key
    ): FirebaseFunctionsCaller<Functions[Key]> {
        const name = this.name === '' ? `${this.name}-${key as string}` : key;
        return new FirebaseFunctionsCaller(this.functions[key], this.options, name);
    }

    private createMacTag(parameters: unknown, key: Uint8Array): string {
        const messageAuthenticater = new HMAC(key);
        const parametersBytesCoder = new Utf8BytesCoder();
        const encodedParameters = parametersBytesCoder.encode(JSON.stringify(parameters));
        const rawTag = messageAuthenticater.sign(encodedParameters);
        const macTagByteCoder = new HexBytesCoder();
        return macTagByteCoder.decode(rawTag);
    }

    private get functionsInstance(): FunctionsInstance {
        const functionsInstance = getFunctions(this.options.app, this.options.region);
        if (this.options.useEmulator)
            connectFunctionsEmulator(functionsInstance, '127.0.0.1', 5001);
        return functionsInstance;
    }

    public async callFunction(
        parameters: FirebaseFunctions.FunctionFlattenParameters<Functions>
    ): Promise<FirebaseFunctions.FunctionReturnType<Functions>> {
        const macTag = this.createMacTag(parameters, this.options.macKey);
        const callableFunction = httpsCallable(this.functionsInstance, this.name);
        const response = await callableFunction({
            verboseLogger: true,
            macTag: macTag,
            parameters: parameters
        });
        const result = Result.from(response.data) as Result<FirebaseFunctions.FunctionReturnType<Functions>, unknown>;
        return result.get();
    }

    public async callRequest(
        parameters: FirebaseFunctions.RequestFlattenParameters<Functions>
    ): Promise<FirebaseFunctions.RequestReturnType<Functions>> {
        const macTag = this.createMacTag(parameters, this.options.macKey);
        const url = `${this.options.requestBaseUrl}/${this.options.region}/${this.name}`;
        const response = await axios.post(url, {
            verboseLogger: true,
            macTag: macTag,
            parameters: parameters
        });
        const result = Result.from(response.data) as Result<FirebaseFunctions.RequestReturnType<Functions>, unknown>;
        return result.get();
    }
}
