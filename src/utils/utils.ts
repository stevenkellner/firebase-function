import * as functions from 'firebase-functions';
import { HexBytesCoder, Utf8BytesCoder } from '../bytesCoder';
import { HMAC } from '../messageAuthenticator';
import { Result } from './Result';
import type { FunctionsErrorCode } from 'firebase-functions/lib/common/providers/https';

export function verifyMacTag(tag: string, parameters: unknown, key: Uint8Array): boolean {
    const messageAuthenticater = new HMAC(key);
    const macTagByteCoder = new HexBytesCoder();
    const rawMacTag = macTagByteCoder.encode(tag);
    const parametersBytesCoder = new Utf8BytesCoder();
    const encodedParameters = parametersBytesCoder.encode(JSON.stringify(parameters));
    return messageAuthenticater.verify(encodedParameters, rawMacTag);
}

function isFirebaseErrorCode(code: string): code is FunctionsErrorCode {
    return [
        'ok', 'cancelled', 'unknown', 'invalid-argument', 'deadline-exceeded', 'not-found', 'already-exists',
        'permission-denied', 'resource-exhausted', 'failed-precondition', 'aborted', 'out-of-range', 'unimplemented',
        'internal', 'unavailable', 'data-loss', 'unauthenticated'
    ].includes(code);
}

function convertToHttpsError(error: unknown): functions.https.HttpsError {
    let code: FunctionsErrorCode = 'unknown';
    let message: string = 'Unknown error occured';
    let details: unknown = null;
    if (typeof error === 'object' && error !== null) {
        if ('code' in error && typeof error.code === 'string' && isFirebaseErrorCode(error.code))
            code = error.code;
        if ('message' in error && typeof error.message === 'string')
            message = error.message;
        if ('details' in error)
            details = error.details;
    }
    return new functions.https.HttpsError(code, message, details);
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
