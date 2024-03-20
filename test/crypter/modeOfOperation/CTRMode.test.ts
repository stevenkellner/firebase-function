import { randomBytes } from 'crypto';
import { CTRMode, xor } from '../../../src';
import { expect } from '../../../testSrc';
import { Block } from 'aes-ts';

describe('CTRMode', () => {
    it('increment counter', () => {
        const ctrMode = new CTRMode() as unknown as { counter: Uint8Array | null; incrementCounter(): void };

        ctrMode.counter = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        ctrMode.incrementCounter();
        expect(ctrMode.counter).to.be.deep.equal(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]));

        ctrMode.counter = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255]);
        ctrMode.incrementCounter();
        expect(ctrMode.counter).to.be.deep.equal(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]));

        ctrMode.counter = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255]);
        ctrMode.incrementCounter();
        expect(ctrMode.counter).to.be.deep.equal(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]));

        ctrMode.counter = new Uint8Array([255, 255, 45, 87, 221, 198, 7, 255, 34, 252, 255, 146, 0, 65, 255, 56]);
        ctrMode.incrementCounter();
        expect(ctrMode.counter).to.be.deep.equal(new Uint8Array([255, 255, 45, 87, 221, 198, 7, 255, 34, 252, 255, 146, 0, 65, 255, 57]));

        ctrMode.counter = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]);
        ctrMode.incrementCounter();
        expect(ctrMode.counter).to.be.deep.equal(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

        ctrMode.counter = new Uint8Array([255, 255, 45, 87, 221, 198, 7, 255, 34, 252, 255, 146, 0, 65, 255, 56]);
        for (let i = 0; i < 1030; i++)
            ctrMode.incrementCounter();
        expect(ctrMode.counter).to.be.deep.equal(new Uint8Array([255, 255, 45, 87, 221, 198, 7, 255, 34, 252, 255, 146, 0, 66, 3, 62]));
    });

    function incremented(counter: Uint8Array, times: number = 1): Uint8Array {
        const ctrMode = new CTRMode() as unknown as { counter: Uint8Array | null; incrementCounter(): void };
        ctrMode.counter = new Uint8Array(counter);
        for (let i = 0; i < times; i++)
            ctrMode.incrementCounter();
        return ctrMode.counter;
    }

    it('encrypt', () => {
        const modeOfOperation = new CTRMode();
        const counter = new Uint8Array(modeOfOperation.startEncryption());
        const block1 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const block2 = randomBytes(16);
        const block3 = randomBytes(16);
        const encrypted1 = modeOfOperation.combineEncryption(block1, block => block);
        const encrypted2 = modeOfOperation.combineEncryption(block2, block => block);
        const encrypted3 = modeOfOperation.combineEncryption(block3, block => block);
        expect(encrypted1).to.be.deep.equal(incremented(counter, 1));
        expect(encrypted2).to.be.deep.equal(xor(block2, incremented(counter, 2)));
        expect(encrypted3).to.be.deep.equal(xor(block3, incremented(counter, 3)));
        expect(modeOfOperation.finishEncryption()).to.be.deep.equal(new Uint8Array());
    });

    it('decrypt', () => {
        const modeOfOperation = new CTRMode();
        expect(modeOfOperation.startDecryption()).to.be.deep.equal(new Uint8Array());
        const counter = randomBytes(16);
        const block1 = new Uint8Array(counter);
        const block2 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const block3 = randomBytes(16);
        const decrypted1 = modeOfOperation.combineDecryption(block1, block => block);
        const decrypted2 = modeOfOperation.combineDecryption(block2, block => block);
        const decrypted3 = modeOfOperation.combineDecryption(block3, block => block);
        expect(decrypted1).to.be.deep.equal(new Uint8Array());
        expect(decrypted2).to.be.deep.equal(incremented(counter, 1));
        expect(decrypted3).to.be.deep.equal(xor(block3, incremented(counter, 2)));
        expect(modeOfOperation.finishDecryption()).to.be.deep.equal(new Uint8Array());
    });

    it('encrypt and decrypt trivial', () => {
        const modeOfOperation = new CTRMode();
        const counter = new Uint8Array(modeOfOperation.startEncryption());
        const block1 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const block2 = randomBytes(16);
        const block3 = randomBytes(16);
        const encrypted1 = modeOfOperation.combineEncryption(block1, block => block);
        const encrypted2 = modeOfOperation.combineEncryption(block2, block => block);
        const encrypted3 = modeOfOperation.combineEncryption(block3, block => block);
        modeOfOperation.finishEncryption();
        modeOfOperation.startDecryption();
        modeOfOperation.combineDecryption(counter, block => block);
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
        const modeOfOperation = new CTRMode();
        const counter = new Uint8Array(modeOfOperation.startEncryption());
        const block1 = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const block2 = randomBytes(16);
        const block3 = randomBytes(16);
        const encrypted1 = modeOfOperation.combineEncryption(block1, block => blockCrypter.encrypt(block));
        const encrypted2 = modeOfOperation.combineEncryption(block2, block => blockCrypter.encrypt(block));
        const encrypted3 = modeOfOperation.combineEncryption(block3, block => blockCrypter.encrypt(block));
        modeOfOperation.finishEncryption();
        modeOfOperation.startDecryption();
        modeOfOperation.combineDecryption(counter, block => blockCrypter.decrypt(block));
        const decrypted1 = modeOfOperation.combineDecryption(encrypted1, block => blockCrypter.decrypt(block));
        const decrypted2 = modeOfOperation.combineDecryption(encrypted2, block => blockCrypter.decrypt(block));
        const decrypted3 = modeOfOperation.combineDecryption(encrypted3, block => blockCrypter.decrypt(block));
        modeOfOperation.finishDecryption();
        expect(decrypted1).to.be.deep.equal(block1);
        expect(decrypted2).to.be.deep.equal(block2);
        expect(decrypted3).to.be.deep.equal(block3);
    });
});
