import { HexBytesCoder } from '../../src';
import { expect } from '../../src/testSrc';

describe('HexBytesCoder', () => {
    const bytesCoder = new HexBytesCoder();

    it('encode', () => {
        expect(bytesCoder.encode('8c2fb80c93415558890f95a27c901f74')).to.be.deep.equal(new Uint8Array([140, 47, 184, 12, 147, 65, 85, 88, 137, 15, 149, 162, 124, 144, 31, 116]));
        expect(bytesCoder.encode('CBD9258D2E98185559AC04CC54F4F614')).to.be.deep.equal(new Uint8Array([203, 217, 37, 141, 46, 152, 24, 85, 89, 172, 4, 204, 84, 244, 246, 20]));
    });

    it('decode', () => {
        expect(bytesCoder.decode(new Uint8Array([140, 47, 184, 12, 147, 65, 85, 88, 137, 15, 149, 162, 124, 144, 31, 116]))).to.be.deep.equal('8c2fb80c93415558890f95a27c901f74');
        expect(bytesCoder.decode(new Uint8Array([203, 217, 37, 141, 46, 152, 24, 85, 89, 172, 4, 204, 84, 244, 246, 20]))).to.be.deep.equal('cbd9258d2e98185559ac04cc54f4f614');
    });
});
