import { FirebaseError } from '../../src';
import { expect } from '../../testSrc';

describe('FirebaseResult', () => {
    it('isFirebaseErrorCode', () => {
        expect(FirebaseError.isFirebaseErrorCode('invalid')).to.be.equal(false);
        expect(FirebaseError.isFirebaseErrorCode('ok')).to.be.equal(true);
        expect(FirebaseError.isFirebaseErrorCode('unauthenticated')).to.be.equal(true);
    });

    it('toFirebaseError', () => {
        // eslint-disable-next-line no-undefined
        expect(FirebaseError.toFirebaseError(null)).to.be.deep.equal({ name: 'FirebaseError', code: 'unknown', message: 'Unknown error occured, see details for more infos.', details: null, stack: undefined });
        expect(FirebaseError.toFirebaseError({ code: 'invalid', message: 'the-message', details: 'abc', stack: 'xyz' })).to.be.deep.equal({ name: 'FirebaseError', code: 'unknown', message: 'the-message', details: 'abc', stack: 'xyz' });
        expect(FirebaseError.toFirebaseError({ code: 'unavailable', message: 'the-message', details: 'abc', stack: 'xyz' })).to.be.deep.equal({ name: 'FirebaseError', code: 'unavailable', message: 'the-message', details: 'abc', stack: 'xyz' });
    });
});
