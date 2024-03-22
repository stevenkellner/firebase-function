import { HMAC, type IHasher } from '../../src';
import { expect } from '../../testSrc';

class IdentityHasher implements IHasher {

    public hash(data: Uint8Array): Uint8Array {
        return data;
    }
}

describe('HMAC', () => {

    it('sign trivial, empty key', () => {
        const hmac = new HMAC(new Uint8Array(), new IdentityHasher());
        expect(hmac.sign(new Uint8Array())).to.be.deep.equal(new Uint8Array([]));
        expect(hmac.sign(new Uint8Array([102, 0, 93, 29, 31, 123, 203, 122]))).to.be.deep.equal(new Uint8Array([102, 0, 93, 29, 31, 123, 203, 122]));
    });

    it('sign trivial', () => {
        const hmac = new HMAC(new Uint8Array([40, 16, 35, 40, 160, 66, 72, 49, 101, 141, 148, 78, 43, 238, 94, 235]), new IdentityHasher());
        expect(hmac.sign(new Uint8Array())).to.be.deep.equal(new Uint8Array([116, 76, 127, 116, 252, 30, 20, 109, 57, 209, 200, 18, 119, 178, 2, 183, 30, 38, 21, 30, 150, 116, 126, 7, 83, 187, 162, 120, 29, 216, 104, 221]));
        expect(hmac.sign(new Uint8Array([102, 0, 93, 29, 31, 123, 203, 122]))).to.be.deep.equal(new Uint8Array([116, 76, 127, 116, 252, 30, 20, 109, 57, 209, 200, 18, 119, 178, 2, 183, 30, 38, 21, 30, 150, 116, 126, 7, 83, 187, 162, 120, 29, 216, 104, 221, 102, 0, 93, 29, 31, 123, 203, 122]));
    });

    it('sign sha512', () => {
        const hmac = new HMAC(new Uint8Array([40, 16, 35, 40, 160, 66, 72, 49, 101, 141, 148, 78, 43, 238, 94, 235]));
        expect(hmac.sign(new Uint8Array())).to.be.deep.equal(new Uint8Array([134, 28, 225, 172, 185, 180, 14, 142, 68, 153, 232, 124, 188, 178, 115, 225, 224, 35, 126, 60, 125, 190, 252, 111, 59, 175, 90, 227, 216, 240, 152, 213, 137, 135, 238, 225, 116, 244, 196, 31, 214, 99, 51, 83, 160, 41, 126, 240, 19, 106, 159, 17, 249, 90, 246, 65, 205, 19, 116, 216, 180, 107, 136, 216]));
        expect(hmac.sign(new Uint8Array([102, 0, 93, 29, 31, 123, 203, 122]))).to.be.deep.equal(new Uint8Array([215, 28, 200, 176, 199, 87, 18, 194, 95, 220, 255, 249, 112, 140, 208, 252, 206, 89, 228, 90, 5, 193, 54, 182, 204, 43, 141, 243, 192, 99, 148, 135, 248, 241, 31, 224, 150, 169, 32, 154, 109, 95, 5, 184, 174, 203, 48, 114, 199, 140, 54, 95, 170, 182, 155, 226, 92, 183, 117, 192, 109, 140, 25, 144]));
    });

    it('verify trivial', () => {
        const hmac = new HMAC(new Uint8Array([40, 16, 35, 40, 160, 66, 72, 49, 101, 141, 148, 78, 43, 238, 94, 235]), new IdentityHasher());
        expect(hmac.verify(new Uint8Array(), new Uint8Array())).to.be.equal(false);
        expect(hmac.verify(new Uint8Array(), new Uint8Array([115, 76, 127, 116, 252, 30, 20, 109, 57, 209, 200, 18, 119, 178, 2, 183, 30, 38, 21, 30, 150, 116, 126, 7, 83, 187, 162, 120, 29, 216, 104, 221]))).to.be.equal(false);
        expect(hmac.verify(new Uint8Array(), new Uint8Array([116, 76, 127, 116, 252, 30, 20, 109, 57, 209, 200, 18, 119, 178, 2, 183, 30, 38, 21, 30, 150, 116, 126, 7, 83, 187, 162, 120, 29, 216, 104, 220]))).to.be.equal(false);
        expect(hmac.verify(new Uint8Array(), new Uint8Array([116, 76, 127, 116, 252, 30, 20, 109, 57, 209, 200, 18, 119, 178, 2, 183, 30, 38, 21, 30, 150, 116, 126, 7, 83, 187, 162, 120, 29, 216, 104, 221]))).to.be.equal(true);
    });

    it('verify', () => {
        const hmac = new HMAC(new Uint8Array([40, 16, 35, 40, 160, 66, 72, 49, 101, 141, 148, 78, 43, 238, 94, 235]));
        expect(hmac.verify(new Uint8Array(), new Uint8Array([134, 28, 225, 172, 185, 180, 14, 142, 68, 153, 232, 124, 188, 178, 115, 225, 224, 35, 126, 60, 125, 190, 252, 111, 59, 175, 90, 227, 216, 240, 152, 213, 137, 135, 238, 225, 116, 244, 196, 31, 214, 99, 51, 83, 160, 41, 126, 240, 19, 106, 159, 17, 249, 90, 246, 65, 205, 19, 116, 216, 180, 107, 136, 216]))).to.be.equal(true);
        expect(hmac.verify(new Uint8Array([102, 0, 93, 29, 31, 123, 203, 122]), new Uint8Array([215, 28, 200, 176, 199, 87, 18, 194, 95, 220, 255, 249, 112, 140, 208, 252, 206, 89, 228, 90, 5, 193, 54, 182, 204, 43, 141, 243, 192, 99, 148, 135, 248, 241, 31, 224, 150, 169, 32, 154, 109, 95, 5, 184, 174, 203, 48, 114, 199, 140, 54, 95, 170, 182, 155, 226, 92, 183, 117, 192, 109, 140, 25, 144]))).to.be.equal(true);
    });
});
