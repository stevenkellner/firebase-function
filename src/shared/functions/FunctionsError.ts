import type { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import type { FunctionsErrorCode as FirebaseFunctionsErrorCode } from 'firebase-functions/lib/common/providers/https';

export type FunctionsErrorCode = FirebaseFunctionsErrorCode;

export namespace FunctionsErrorCode {

    export function isFunctionsErrorCode(code: string): code is FunctionsErrorCode {
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
}

export class FunctionsError extends Error implements Flattable<FunctionsError.Flatten> {

    public readonly name = 'FunctionsError';

    public constructor(
        public readonly code: FunctionsErrorCode,
        public readonly message: string,
        public readonly details: string | null = null
    ) {
        super(message);
    }

    public get flatten(): FunctionsError.Flatten {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            details: this.details
        };
    }
}

// istanbul ignore next
export namespace FunctionsError {

    export type Flatten = {
        name: 'FunctionsError';
        code: FunctionsErrorCode;
        message: string;
        details: string | null;
    };

    export class TypeBuilder implements ITypeBuilder<FunctionsError.Flatten, FunctionsError> {

        public build(flatten: FunctionsError.Flatten): FunctionsError {
            return new FunctionsError(flatten.code, flatten.message, flatten.details);
        }
    }
}
