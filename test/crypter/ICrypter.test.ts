import { randomBytes } from 'crypto';
import { AES } from '../../src';
import { expect } from 'chai';

describe('ICrypter', () => {
    it('encrypt and decrypt', () => {
        const aes = new AES(randomBytes(16));
        for (let i = 1; i < 16; i++) {
            for (let j = 0; j <= i; j++) {
                const data = randomBytes(j);
                const encryptedData = aes.encrypt(data);
                const decryptedData = aes.decrypt(encryptedData);
                expect(decryptedData).to.be.deep.equal(data);
            }
        }
    });
});
