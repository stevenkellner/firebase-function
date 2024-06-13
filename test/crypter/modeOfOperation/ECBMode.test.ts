import { randomBytes } from 'crypto';
import { ECBMode } from '../../../src';
import { expect } from '../../../src/testSrc';
import { Block } from 'aes-ts';

describe('ECBMode', () => {
    it('encrypt', () => {
        const modeOfOperation = new ECBMode();
        expect(modeOfOperation.startEncryption()).to.be.deep.equal(new Uint8Array());
        const block1 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const block2 = randomBytes(16);
        const block3 = randomBytes(16);
        const encrypted1 = modeOfOperation.combineEncryption(block1, block => block);
        const encrypted2 = modeOfOperation.combineEncryption(block2, block => block);
        const encrypted3 = modeOfOperation.combineEncryption(block3, block => block);
        expect(encrypted1).to.be.deep.equal(block1);
        expect(encrypted2).to.be.deep.equal(block2);
        expect(encrypted3).to.be.deep.equal(block3);
        expect(modeOfOperation.finishEncryption()).to.be.deep.equal(new Uint8Array());
    });

    it('decrypt', () => {
        const modeOfOperation = new ECBMode();
        expect(modeOfOperation.startDecryption()).to.be.deep.equal(new Uint8Array());
        const block1 = randomBytes(16);
        const block2 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const block3 = randomBytes(16);
        const decrypted1 = modeOfOperation.combineDecryption(block1, block => block);
        const decrypted2 = modeOfOperation.combineDecryption(block2, block => block);
        const decrypted3 = modeOfOperation.combineDecryption(block3, block => block);
        expect(decrypted1).to.be.deep.equal(block1);
        expect(decrypted2).to.be.deep.equal(block2);
        expect(decrypted3).to.be.deep.equal(block3);
        expect(modeOfOperation.finishDecryption()).to.be.deep.equal(new Uint8Array());
    });

    it('encrypt and decrypt trivial', () => {
        const modeOfOperation = new ECBMode();
        modeOfOperation.startEncryption();
        const block1 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const block2 = randomBytes(16);
        const block3 = randomBytes(16);
        const encrypted1 = modeOfOperation.combineEncryption(block1, block => block);
        const encrypted2 = modeOfOperation.combineEncryption(block2, block => block);
        const encrypted3 = modeOfOperation.combineEncryption(block3, block => block);
        modeOfOperation.finishEncryption();
        modeOfOperation.startDecryption();
        const decrypted1 = modeOfOperation.combineDecryption(encrypted1, block => block);
        const decrypted2 = modeOfOperation.combineDecryption(encrypted2, block => block);
        const decrypted3 = modeOfOperation.combineDecryption(encrypted3, block => block);
        modeOfOperation.finishDecryption();
        expect(decrypted1).to.be.deep.equal(block1);
        expect(decrypted2).to.be.deep.equal(block2);
        expect(decrypted3).to.be.deep.equal(block3);
    });

    it('encrypt and decrypt aes', () => {
        const blockCrypter = new Block(randomBytes(16));
        const modeOfOperation = new ECBMode();
        modeOfOperation.startEncryption();
        const block1 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const block2 = randomBytes(16);
        const block3 = randomBytes(16);
        const encrypted1 = modeOfOperation.combineEncryption(block1, block => blockCrypter.encrypt(block));
        const encrypted2 = modeOfOperation.combineEncryption(block2, block => blockCrypter.encrypt(block));
        const encrypted3 = modeOfOperation.combineEncryption(block3, block => blockCrypter.encrypt(block));
        modeOfOperation.finishEncryption();
        modeOfOperation.startDecryption();
        const decrypted1 = modeOfOperation.combineDecryption(encrypted1, block => blockCrypter.decrypt(block));
        const decrypted2 = modeOfOperation.combineDecryption(encrypted2, block => blockCrypter.decrypt(block));
        const decrypted3 = modeOfOperation.combineDecryption(encrypted3, block => blockCrypter.decrypt(block));
        modeOfOperation.finishDecryption();
        expect(decrypted1).to.be.deep.equal(block1);
        expect(decrypted2).to.be.deep.equal(block2);
        expect(decrypted3).to.be.deep.equal(block3);
    });
});
