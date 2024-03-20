import type { FunctionsErrorCode } from 'firebase-functions/lib/common/providers/https';
import type { Result } from '../utils/Result';

export interface FirebaseError extends Error {
    name: 'FirebaseError';
    code: FirebaseError.Code;
    message: string;
    details?: unknown;
    stack?: string;
}

export namespace FirebaseError {
    export type Code = FunctionsErrorCode;

    export function isFirebaseErrorCode(code: string): code is FirebaseError.Code {
        return [
            'ok', 'cancelled', 'unknown', 'invalid-argument', 'deadline-exceeded', 'not-found', 'already-exists',
            'permission-denied', 'resource-exhausted', 'failed-precondition', 'aborted', 'out-of-range', 'unimplemented',
            'internal', 'unavailable', 'data-loss', 'unauthenticated'
        ].includes(code);
    }

    export function toFirebaseError(error: unknown): FirebaseError {
        const errorIsObject = error !== null && typeof error === 'object';
        // eslint-disable-next-line no-undefined
        const hasMessage = errorIsObject && 'message' in error && error.message !== undefined && error.message !== null && error.message !== '';
        // eslint-disable-next-line no-undefined
        const hasStack = errorIsObject && 'stack' in error && error.stack !== undefined && error.stack !== null && error.stack !== '';
        return {
            name: 'FirebaseError',
            code: errorIsObject && 'code' in error && typeof error.code === 'string' && isFirebaseErrorCode(error.code) ? error.code : 'unknown',
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            message: hasMessage ? `${error.message}` : 'Unknown error occured, see details for more infos.',
            details: hasMessage && 'details' in error ? error.details : error,
            // eslint-disable-next-line no-undefined, @typescript-eslint/restrict-template-expressions
            stack: hasStack ? `${error.stack}` : undefined
        };
    }
}

export type FirebaseResult<T> = Result<T, FirebaseError>;
