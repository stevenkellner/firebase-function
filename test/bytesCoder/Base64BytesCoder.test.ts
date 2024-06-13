import { Base64BytesCoder } from '../../src';
import { expect } from '../../src/testSrc';

describe('Base64BytesCoder', () => {
    const bytesCoder = new Base64BytesCoder();

    it('encode', () => {
        expect(bytesCoder.encode('StMqe7yA2IbxPzF1XyrNlw==')).to.be.deep.equal(new Uint8Array([74, 211, 42, 123, 188, 128, 216, 134, 241, 63, 49, 117, 95, 42, 205, 151]));
        expect(bytesCoder.encode('Msum6z5abPiyJP5Q1+FMo1O+nnhYAOrFm8s===')).to.be.deep.equal(new Uint8Array([50, 203, 166, 235, 62, 90, 108, 248, 178, 36, 254, 80, 215, 225, 76, 163, 83, 190, 158, 120, 88, 0, 234, 197, 155, 203]));
    });

    it('decode', () => {
        expect(bytesCoder.decode(new Uint8Array([74, 211, 42, 123, 188, 128, 216, 134, 241, 63, 49, 117, 95, 42, 205, 151]))).to.be.deep.equal('StMqe7yA2IbxPzF1XyrNlw==');
        expect(bytesCoder.decode(new Uint8Array([50, 203, 166, 235, 62, 90, 108, 248, 178, 36, 254, 80, 215, 225, 76, 163, 83, 190, 158, 120, 88, 0, 234, 197, 155, 203]))).to.be.deep.equal('Msum6z5abPiyJP5Q1+FMo1O+nnhYAOrFm8s=');
    });
});
