import { Result } from '@stevenkellner/typescript-common-functionality';
import * as functions from 'firebase-functions';
import type { FunctionsErrorCode } from 'firebase-functions/lib/common/providers/https';

function isFirebaseErrorCode(code: string): code is FunctionsErrorCode {
    return [
        'ok',
        'cancelled',
        'unknown',
        'invalid-argument',
        'deadline-exceeded',
        'not-found',
        'already-exists',
        'permission-denied',
        'resource-exhausted',
        'failed-precondition',
        'aborted',
        'out-of-range',
        'unimplemented',
        'internal',
        'unavailable',
        'data-loss',
        'unauthenticated'
    ].includes(code);
}

function convertToHttpsError(error: unknown): functions.https.HttpsError {
    let code: FunctionsErrorCode = 'unknown';
    let message: string = 'Unknown error occured';
    if (typeof error === 'object' && error !== null) {
        if ('code' in error && typeof error.code === 'string' && isFirebaseErrorCode(error.code))
            code = error.code;
        if ('message' in error && typeof error.message === 'string')
            message = error.message;
    }
    return new functions.https.HttpsError(code, message, error);
}

export async function catchErrorToResult<T>(
    _function: () => Promise<T>
): Promise<Result<T, functions.https.HttpsError>> {
    try {
        return await _function()
            .then(value => Result.success(value))
            .catch((error: unknown) => Result.failure(convertToHttpsError(error)));
    } catch (error) {
        return Result.failure(convertToHttpsError(error));
    }
}
