import { expect } from '@assertive-ts/core';
import { createMacTag } from '../../src/client/functions/createMacTag';
import { verifyMacTag } from '../../src/admin/functions/verifyMacTag';

describe('MAC Tag Functions', () => {
    const key = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

    describe('createMacTag', () => {
        it('should create a valid MAC tag for given parameters', () => {
            const parameters = { foo: 'bar' };
            const tag = createMacTag(parameters, key);
            expect(tag).toBeOfType('string');
            expect(tag.length).toBeGreaterThan(0);
        });

        it('should create different MAC tags for different parameters', () => {
            const parameters1 = { foo: 'bar' };
            const parameters2 = { foo: 'baz' };
            const tag1 = createMacTag(parameters1, key);
            const tag2 = createMacTag(parameters2, key);
            expect(tag1).not.toBeEqual(tag2);
        });

        it('should create the same MAC tag for the same parameters and key', () => {
            const parameters = { foo: 'bar' };
            const tag1 = createMacTag(parameters, key);
            const tag2 = createMacTag(parameters, key);
            expect(tag1).toBeEqual(tag2);
        });

        it('should handle undefined parameters', () => {
            const tag = createMacTag(undefined, key);
            expect(tag).toBeOfType('string');
            expect(tag.length).toBeGreaterThan(0);
        });
    });

    describe('verifyMacTag', () => {
        it('should verify a valid MAC tag', () => {
            const parameters = { foo: 'bar' };
            const tag = createMacTag(parameters, key);
            const isValid = verifyMacTag(tag, parameters, key);
            expect(isValid).toBeTrue();
        });

        it('should not verify an invalid MAC tag', () => {
            const parameters = { foo: 'bar' };
            const invalidTag = 'invalidtag';
            const isValid = verifyMacTag(invalidTag, parameters, key);
            expect(isValid).toBeFalse();
        });

        it('should not verify a MAC tag with different parameters', () => {
            const parameters1 = { foo: 'bar' };
            const parameters2 = { foo: 'baz' };
            const tag = createMacTag(parameters1, key);
            const isValid = verifyMacTag(tag, parameters2, key);
            expect(isValid).toBeFalse();
        });

        it('should handle undefined parameters', () => {
            const tag = createMacTag(undefined, key);
            const isValid = verifyMacTag(tag, undefined, key);
            expect(isValid).toBeTrue();
        });
    });
});
