import { xor } from '../../src';
import { expect } from '../../src/testSrc';

describe('xor', () => {
    it('not same length', () => {
        expect(() => xor(new Uint8Array([8]), new Uint8Array([16, 32]))).to.throw();
        expect(() => xor(new Uint8Array([]), new Uint8Array([16, 32]))).to.throw();
        expect(() => xor(new Uint8Array([8]), new Uint8Array([]))).to.throw();
    });

    it('same length', () => {
        expect(xor(new Uint8Array([]), new Uint8Array([]))).to.be.deep.equal(new Uint8Array([]));
        expect(xor(new Uint8Array([255]), new Uint8Array([8]))).to.be.deep.equal(new Uint8Array([247]));
        expect(xor(new Uint8Array([255, 52, 83, 83, 6]), new Uint8Array([8, 23, 65, 1, 237]))).to.be.deep.equal(new Uint8Array([247, 35, 18, 82, 235]));
    });
});
