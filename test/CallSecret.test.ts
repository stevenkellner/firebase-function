import { CallSecret, DummyLogger, Sha512, UtcDate } from '../src';
import { expect } from 'chai';

describe('CallSecret', () => {
    it('fromObject', () => {
        expect(() => CallSecret.fromObject(null, new DummyLogger())).to.throw();
        expect(() => CallSecret.fromObject({ expiresAt: 0, hashedData: 0 }, new DummyLogger())).to.throw();
        expect(() => CallSecret.fromObject({ expiresAt: '', hashedData: 0 }, new DummyLogger())).to.throw();
        const expiresAt = UtcDate.now;
        expect(CallSecret.fromObject({
            expiresAt: expiresAt.encoded,
            hashedData: 'abc'
        }, new DummyLogger())).to.be.deep.equal({
            expiresAt: expiresAt.encoded,
            hashedData: 'abc'
        });
    });

    it('check', () => {
        const expiresAt = UtcDate.now;
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        expect(() => CallSecret.checkCallSecret({ expiresAt: expiresAt.encoded, hashedData: 'abc' }, 'xyz', new DummyLogger())).to.throw();
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        expect(() => CallSecret.checkCallSecret({ expiresAt: expiresAt.advanced({ minute: -1 }).encoded, hashedData: new Sha512().hash(expiresAt.advanced({ minute: -1 }).encoded, 'xyz') }, 'xyz', new DummyLogger())).to.throw();
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        expect(() => CallSecret.checkCallSecret({ expiresAt: expiresAt.advanced({ minute: 1 }).encoded, hashedData: new Sha512().hash(expiresAt.advanced({ minute: 1 }).encoded, 'xyz') }, 'xyz', new DummyLogger())).not.to.throw();
    });
});
