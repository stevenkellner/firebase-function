import * as functions from 'firebase-functions';
import { HexBytesCoder, Utf8BytesCoder } from '../bytesCoder';
import { HMAC } from '../messageAuthenticator';
import { Result } from './Result';

export function verifyMacTag(tag: string, parameters: unknown, key: Uint8Array): boolean {
    const messageAuthenticater = new HMAC(key);
    const macTagByteCoder = new HexBytesCoder();
    const rawMacTag = macTagByteCoder.encode(tag);
    const parametersBytesCoder = new Utf8BytesCoder();
    const encodedParameters = parametersBytesCoder.encode(JSON.stringify(parameters));
    return messageAuthenticater.verify(encodedParameters, rawMacTag);
}

function convertToHttpsError(error: unknown): functions.https.HttpsError {
    if (error instanceof functions.https.HttpsError)
        return error;
    return new functions.https.HttpsError('unknown', 'Unknown error occured', error);
}

export async function execute<T>(
    _function: () => Promise<T>
): Promise<Result<T, functions.https.HttpsError>> {
    try {
        return await _function()
            .then(value => Result.success(value))
            .catch(error => Result.failure(convertToHttpsError(error)));
    } catch (error) {
        return Result.failure(convertToHttpsError(error));
    }
}
