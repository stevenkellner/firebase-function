import { httpsCallable, type Functions as FunctionsInstance } from 'firebase/functions';
import axios from 'axios';
import type { FirebaseApp } from './FirebaseApp';
import { Utf8BytesCoder, HexBytesCoder } from '../bytesCoder';
import type { FirebaseFunctions } from '../firebase';
import { HMAC } from '../messageAuthenticator';
import { type Flatten, Result } from '../utils';

export class FirebaseFunctionsCaller<Functions extends FirebaseFunctions> {

    public constructor(
        private readonly options: FirebaseApp.Options,
        private readonly functionsInstance: FunctionsInstance,
        private readonly name: string | null = null
    ) {}

    public function<Key extends FirebaseFunctions.IsRecord<Functions> extends true ? keyof Functions & string : never>(
        key: Key
    ): FirebaseFunctionsCaller<Functions extends { [key: string]: FirebaseFunctions } ? Functions[Key] : never> {
        const name = this.name !== null ? `${this.name}-${key}` : key;
        return new FirebaseFunctionsCaller(this.options, this.functionsInstance, name);
    }

    private createMacTag(parameters: unknown, key: Uint8Array): string {
        const messageAuthenticater = new HMAC(key);
        const parametersBytesCoder = new Utf8BytesCoder();
        const encodedParameters = parametersBytesCoder.encode(JSON.stringify(parameters));
        const rawTag = messageAuthenticater.sign(encodedParameters);
        const macTagByteCoder = new HexBytesCoder();
        return macTagByteCoder.decode(rawTag);
    }

    public async callFunction(
        parameters: Flatten<FirebaseFunctions.FunctionParameters<Functions>>
    ): Promise<FirebaseFunctions.FunctionReturnType<Functions>> {
        if (this.name === null)
            throw new Error('The function name must be defined');
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
        parameters: Flatten<FirebaseFunctions.RequestParameters<Functions>>
    ): Promise<FirebaseFunctions.RequestReturnType<Functions>> {
        if (this.name === null)
            throw new Error('The function name must be defined');
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
