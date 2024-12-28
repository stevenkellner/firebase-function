import { BytesCoder, HMAC } from '@stevenkellner/typescript-common-functionality';

export function createMacTag(parameters: unknown, key: Uint8Array): string {
    const messageAuthenticater = new HMAC(key);
    const jsonString = parameters === undefined ? '' : JSON.stringify(parameters);
    const encodedParameters = BytesCoder.fromUtf8(jsonString);
    const tagBytes = messageAuthenticater.sign(encodedParameters);
    return BytesCoder.toHex(tagBytes);
}
