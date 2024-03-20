import * as functions from 'firebase-functions';
import { HttpsError, VoidLogger } from '../../src';
import { expect } from '../../testSrc';

describe('HttpsError', () => {
    it('new error', () => {
        const error = new HttpsError('deadline-exceeded', 'This is a test.', new VoidLogger());
        expect(error).to.be.deep.equal(new functions.https.HttpsError('deadline-exceeded', 'This is a test.', ''));
    });
});
