import { randomBytes } from 'crypto';
import { OFBMode, xor } from '../../../src';
import { expect } from '../../testUtils';
import { Block } from 'aes-ts';

describe('OFBMode', () => {
    it('encrypt', () => {
        const modeOfOperation = new OFBMode();
        const iv = modeOfOperation.startEncryption();
        const block1 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const block2 = randomBytes(16);
        const block3 = randomBytes(16);
        const encrypted1 = modeOfOperation.combineEncryption(block1, block => block);
        const encrypted2 = modeOfOperation.combineEncryption(block2, block => block);
        const encrypted3 = modeOfOperation.combineEncryption(block3, block => block);
        expect(encrypted1).to.be.deep.equal(iv);
        expect(encrypted2).to.be.deep.equal(xor(block2, encrypted1));
        expect(encrypted3).to.be.deep.equal(xor(block3, encrypted2));
        expect(modeOfOperation.finishEncryption()).to.be.deep.equal(new Uint8Array());
    });

    it('decrypt', () => {
        const modeOfOperation = new OFBMode();
        expect(modeOfOperation.startDecryption()).to.be.deep.equal(new Uint8Array());
        const block1 = randomBytes(16);
        const block2 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const block3 = randomBytes(16);
        const decrypted1 = modeOfOperation.combineDecryption(block1, block => block);
        const decrypted2 = modeOfOperation.combineDecryption(block2, block => block);
        const decrypted3 = modeOfOperation.combineDecryption(block3, block => block);
        expect(decrypted1).to.be.deep.equal(new Uint8Array());
        expect(decrypted2).to.be.deep.equal(block1);
        expect(decrypted3).to.be.deep.equal(xor(block3, block2));
        expect(modeOfOperation.finishDecryption()).to.be.deep.equal(new Uint8Array());
    });

    it('encrypt and decrypt trivial', () => {
        const modeOfOperation = new OFBMode();
        const iv = modeOfOperation.startEncryption();
        const block1 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const block2 = randomBytes(16);
        const block3 = randomBytes(16);
        const encrypted1 = modeOfOperation.combineEncryption(block1, block => block);
        const encrypted2 = modeOfOperation.combineEncryption(block2, block => block);
        const encrypted3 = modeOfOperation.combineEncryption(block3, block => block);
        modeOfOperation.finishEncryption();
        modeOfOperation.startDecryption();
        modeOfOperation.combineDecryption(iv, block => block);
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
        const modeOfOperation = new OFBMode();
        const iv = modeOfOperation.startEncryption();
        const block1 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const block2 = randomBytes(16);
        const block3 = randomBytes(16);
        const encrypted1 = modeOfOperation.combineEncryption(block1, block => blockCrypter.encrypt(block));
        const encrypted2 = modeOfOperation.combineEncryption(block2, block => blockCrypter.encrypt(block));
        const encrypted3 = modeOfOperation.combineEncryption(block3, block => blockCrypter.encrypt(block));
        modeOfOperation.finishEncryption();
        modeOfOperation.startDecryption();
        modeOfOperation.combineDecryption(iv, block => blockCrypter.decrypt(block));
        const decrypted1 = modeOfOperation.combineDecryption(encrypted1, block => blockCrypter.decrypt(block));
        const decrypted2 = modeOfOperation.combineDecryption(encrypted2, block => blockCrypter.decrypt(block));
        const decrypted3 = modeOfOperation.combineDecryption(encrypted3, block => blockCrypter.decrypt(block));
        modeOfOperation.finishDecryption();
        expect(decrypted1).to.be.deep.equal(block1);
        expect(decrypted2).to.be.deep.equal(block2);
        expect(decrypted3).to.be.deep.equal(block3);
    });
});
