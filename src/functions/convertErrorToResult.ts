import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError, FunctionsErrorCode } from './FunctionsError';

function convertToFunctionsError(error: unknown): FunctionsError {
    if (error instanceof FunctionsError)
        return error;
    let code: FunctionsErrorCode = 'unknown';
    let message: string = 'Unknown error occured';
    if (typeof error === 'string')
        message = error;
    else if (typeof error === 'object' && error !== null) {
        if ('code' in error && typeof error.code === 'string' && FunctionsErrorCode.isFunctionsErrorCode(error.code))
            code = error.code;
        if ('message' in error && typeof error.message === 'string')
            message = error.message;
    }
    return new FunctionsError(code, message, JSON.stringify(error));
}

export async function convertErrorToResult<T>(execute: () => Promise<T>): Promise<Result<T, FunctionsError>> {
    try {
        return await execute()
            .then(value => Result.success(value))
            .catch((error: unknown) => Result.failure(convertToFunctionsError(error)));
    } catch (error) {
        return Result.failure(convertToFunctionsError(error));
    }
}
