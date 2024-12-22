import { BytesCoder, HMAC } from '@stevenkellner/typescript-common-functionality';

export function verifyMacTag(tag: string, parameters: unknown, key: Uint8Array): boolean {
    const messageAuthenticater = new HMAC(key);
    const rawMacTag = BytesCoder.fromHex(tag);
    const jsonString = parameters === undefined ? '' : JSON.stringify(parameters);
    const encodedParameters = BytesCoder.fromUtf8(jsonString);
    return messageAuthenticater.verify(encodedParameters, rawMacTag);
}
