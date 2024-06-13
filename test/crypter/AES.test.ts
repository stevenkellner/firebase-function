import { randomBytes } from 'crypto';
import { AES, CBCMode, CTRMode, ECBMode, OFBMode, xor } from '../../src';
import { expect } from '../../src/testSrc';

type TestableAES = AES & {
    encryptBlocks(data: Uint8Array): Uint8Array;
    decryptBlocks(data: Uint8Array): Uint8Array;
};

describe('AES', () => {
    it('invalid key length', () => {
        expect(() => new AES(new Uint8Array(1), new ECBMode())).to.throw();
        expect(() => new AES(new Uint8Array(64), new ECBMode())).to.throw();
    });

    it('encrypt ECB', () => {
        const aes = new AES(new Uint8Array([119, 54, 103, 107, 122, 110, 105, 85, 112, 120, 119, 76, 65, 75, 114, 88]), new ECBMode()) as unknown as TestableAES;
        const data = new Uint8Array([115, 113, 110, 114, 69, 71, 72, 80, 105, 110, 57, 120, 117, 115, 80, 56, 70, 77, 67, 102, 57, 54, 81, 52, 52, 73, 113, 114, 69, 12, 234, 98, 84, 86, 109, 113, 85, 118, 86, 114, 101, 113, 100, 88, 86, 72, 56, 99]);
        const expected = new Uint8Array([204, 61, 183, 229, 50, 56, 27, 100, 216, 225, 56, 2, 111, 250, 250, 229, 117, 32, 70, 64, 225, 108, 1, 140, 200, 180, 183, 232, 7, 211, 231, 190, 136, 10, 156, 131, 75, 26, 27, 62, 167, 170, 48, 213, 153, 123, 102, 174]);
        expect(aes.encryptBlocks(data)).to.be.deep.equal(expected);
    });

    it('encrypt OFB', () => {
        const aes = new AES(new Uint8Array([119, 54, 103, 107, 122, 110, 105, 85, 112, 120, 119, 76, 65, 75, 114, 88]), new OFBMode()) as unknown as TestableAES;
        const data = new Uint8Array([115, 113, 110, 114, 69, 71, 72, 80, 105, 110, 57, 120, 117, 115, 80, 56, 70, 77, 67, 102, 57, 54, 81, 52, 52, 73, 113, 114, 69, 12, 234, 98, 84, 86, 109, 113, 85, 118, 86, 114, 101, 113, 100, 88, 86, 72, 56, 99]);
        const encrypted = aes.encryptBlocks(data);
        const iv = encrypted.slice(0, 16);
        const expected1 = xor(new Uint8Array([204, 61, 183, 229, 50, 56, 27, 100, 216, 225, 56, 2, 111, 250, 250, 229]), iv);
        const expected2 = xor(new Uint8Array([117, 32, 70, 64, 225, 108, 1, 140, 200, 180, 183, 232, 7, 211, 231, 190]), expected1);
        const expected3 = xor(new Uint8Array([136, 10, 156, 131, 75, 26, 27, 62, 167, 170, 48, 213, 153, 123, 102, 174]), expected2);
        expect(encrypted).to.be.deep.equal(new Uint8Array([...iv, ...expected1, ...expected2, ...expected3]));
    });

    it('decrypt ECB', () => {
        const aes = new AES(new Uint8Array([119, 54, 103, 107, 122, 110, 105, 85, 112, 120, 119, 76, 65, 75, 114, 88]), new ECBMode()) as unknown as TestableAES;
        const data = new Uint8Array([204, 61, 183, 229, 50, 56, 27, 100, 216, 225, 56, 2, 111, 250, 250, 229, 117, 32, 70, 64, 225, 108, 1, 140, 200, 180, 183, 232, 7, 211, 231, 190, 136, 10, 156, 131, 75, 26, 27, 62, 167, 170, 48, 213, 153, 123, 102, 174]);
        const expected = new Uint8Array([115, 113, 110, 114, 69, 71, 72, 80, 105, 110, 57, 120, 117, 115, 80, 56, 70, 77, 67, 102, 57, 54, 81, 52, 52, 73, 113, 114, 69, 12, 234, 98, 84, 86, 109, 113, 85, 118, 86, 114, 101, 113, 100, 88, 86, 72, 56, 99]);
        expect(aes.decryptBlocks(data)).to.be.deep.equal(expected);
    });

    it('decrypt CBC', () => {
        const aes = new AES(new Uint8Array([119, 54, 103, 107, 122, 110, 105, 85, 112, 120, 119, 76, 65, 75, 114, 88]), new CBCMode()) as unknown as TestableAES;
        const data = new Uint8Array([112, 195, 54, 14, 139, 94, 137, 201, 14, 200, 185, 8, 63, 95, 55, 131, 131, 161, 40, 61, 8, 83, 98, 163, 255, 58, 115, 155, 41, 62, 23, 130, 116, 39, 82, 144, 240, 59, 55, 69, 86, 146, 253, 64, 229, 9, 120, 150, 103, 159, 210, 94, 127, 70, 116, 38, 223, 90, 123, 144, 32, 230, 152, 125]);
        const expected = new Uint8Array([115, 113, 110, 114, 69, 71, 72, 80, 105, 110, 57, 120, 117, 115, 80, 56, 70, 77, 67, 102, 57, 54, 81, 52, 52, 73, 113, 114, 69, 12, 234, 98, 84, 86, 109, 113, 85, 118, 86, 114, 101, 113, 100, 88, 86, 72, 56, 99]);
        expect(aes.decryptBlocks(data)).to.be.deep.equal(expected);
    });

    it('encrypt and decrypt ECB', () => {
        const aes = new AES(randomBytes(16), new ECBMode()) as unknown as TestableAES;
        const data = randomBytes(1024);
        const encrypted = aes.encryptBlocks(data);
        const decrypted = aes.decryptBlocks(encrypted);
        expect(decrypted).to.be.deep.equal(data);
    });

    it('encrypt and decrypt CBC', () => {
        const aes = new AES(randomBytes(16), new CBCMode()) as unknown as TestableAES;
        const data = randomBytes(1024);
        const encrypted = aes.encryptBlocks(data);
        const decrypted = aes.decryptBlocks(encrypted);
        expect(decrypted).to.be.deep.equal(data);
    });

    it('encrypt and decrypt OFB', () => {
        const aes = new AES(randomBytes(16), new OFBMode()) as unknown as TestableAES;
        const data = randomBytes(1024);
        const encrypted = aes.encryptBlocks(data);
        const decrypted = aes.decryptBlocks(encrypted);
        expect(decrypted).to.be.deep.equal(data);
    });

    it('encrypt and decrypt CTR', () => {
        const aes = new AES(randomBytes(16), new CTRMode()) as unknown as TestableAES;
        const data = randomBytes(1024);
        const encrypted = aes.encryptBlocks(data);
        const decrypted = aes.decryptBlocks(encrypted);
        expect(decrypted).to.be.deep.equal(data);
    });
});
