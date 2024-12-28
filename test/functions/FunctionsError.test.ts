import { expect } from '@assertive-ts/core';
import { FunctionsError, FunctionsErrorCode } from '../../src/shared/functions/FunctionsError';

describe('FunctionsError', () => {

    it('should create an instance of FunctionsError', () => {
        const error = new FunctionsError('invalid-argument', 'Invalid argument provided');
        expect(error).toBeInstanceOf(FunctionsError);
        expect(error.name).toBeEqual('FunctionsError');
        expect(error.code).toBeEqual('invalid-argument');
        expect(error.message).toBeEqual('Invalid argument provided');
        expect(error.details).toBeNull();
    });

    it('should flatten the error correctly', () => {
        const error = new FunctionsError('not-found', 'Resource not found', 'Details about the error');
        const flattened = error.flatten;
        expect(flattened).toBeEqual({
            name: 'FunctionsError',
            code: 'not-found',
            message: 'Resource not found',
            details: 'Details about the error'
        });
    });

    it('should build an error from flattened object', () => {
        const flattened: FunctionsError.Flatten = {
            name: 'FunctionsError',
            code: 'permission-denied',
            message: 'Permission denied',
            details: 'Details about the error'
        };
        const builder = new FunctionsError.TypeBuilder();
        const error = builder.build(flattened);
        expect(error).toBeInstanceOf(FunctionsError);
        expect(error.name).toBeEqual('FunctionsError');
        expect(error.code).toBeEqual('permission-denied');
        expect(error.message).toBeEqual('Permission denied');
        expect(error.details).toBeEqual('Details about the error');
    });

    it('should validate FunctionsErrorCode correctly', () => {
        expect(FunctionsErrorCode.isFunctionsErrorCode('ok')).toBeTrue();
        expect(FunctionsErrorCode.isFunctionsErrorCode('invalid-argument')).toBeTrue();
        expect(FunctionsErrorCode.isFunctionsErrorCode('unknown-code')).toBeFalse();
    });
});
