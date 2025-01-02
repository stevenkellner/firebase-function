import { expect } from '@assertive-ts/core';
import { MacTag } from '../../src/functions/MacTag';

describe('MAC Tag Functions', () => {

    const macTag = new MacTag(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]));

    describe('macTag.create', () => {
        it('should create a valid MAC tag for given parameters', () => {
            const parameters = { foo: 'bar' };
            const tag = macTag.create(parameters);
            expect(tag).toBeOfType('string');
            expect(tag.length).toBeGreaterThan(0);
        });

        it('should create different MAC tags for different parameters', () => {
            const parameters1 = { foo: 'bar' };
            const parameters2 = { foo: 'baz' };
            const tag1 = macTag.create(parameters1);
            const tag2 = macTag.create(parameters2);
            expect(tag1).not.toBeEqual(tag2);
        });

        it('should create the same MAC tag for the same parameters and key', () => {
            const parameters = { foo: 'bar' };
            const tag1 = macTag.create(parameters);
            const tag2 = macTag.create(parameters);
            expect(tag1).toBeEqual(tag2);
        });

        it('should handle undefined parameters', () => {
            const tag = macTag.create(undefined);
            expect(tag).toBeOfType('string');
            expect(tag.length).toBeGreaterThan(0);
        });
    });

    describe('macTag.verified', () => {
        it('should verify a valid MAC tag', () => {
            const parameters = { foo: 'bar' };
            const tag = macTag.create(parameters);
            const isValid = macTag.verified(tag, parameters);
            expect(isValid).toBeTrue();
        });

        it('should not verify an invalid MAC tag', () => {
            const parameters = { foo: 'bar' };
            const invalidTag = 'invalidtag';
            const isValid = macTag.verified(invalidTag, parameters);
            expect(isValid).toBeFalse();
        });

        it('should not verify a MAC tag with different parameters', () => {
            const parameters1 = { foo: 'bar' };
            const parameters2 = { foo: 'baz' };
            const tag = macTag.create(parameters1);
            const isValid = macTag.verified(tag, parameters2);
            expect(isValid).toBeFalse();
        });

        it('should handle undefined parameters', () => {
            const tag = macTag.create(undefined);
            const isValid = macTag.verified(tag, undefined);
            expect(isValid).toBeTrue();
        });
    });
});
