import { randomBytes } from 'crypto';
import { ISO10126Padding } from '../../../src';
import { expect } from '../../../testSrc';

describe('ISO10126Padding', () => {
    const padding = new ISO10126Padding();

    it('add padding', () => {
        const dataLength15 = randomBytes(15);
        const dataLength16 = randomBytes(16);
        const dataLength20 = randomBytes(20);
        expect(padding.addPadding(dataLength15, 16).length).to.be.equal(16);
        expect(padding.addPadding(dataLength15, 16).slice(0, 15)).to.be.deep.equal(new Uint8Array([...dataLength15]));
        expect(padding.addPadding(dataLength15, 16)[15]).to.be.equal(1);
        expect(padding.addPadding(dataLength16, 16).length).to.be.equal(32);
        expect(padding.addPadding(dataLength16, 16).slice(0, 16)).to.be.deep.equal(new Uint8Array([...dataLength16]));
        expect(padding.addPadding(dataLength16, 16)[31]).to.be.equal(16);
        expect(padding.addPadding(dataLength20, 16).length).to.be.equal(32);
        expect(padding.addPadding(dataLength20, 16).slice(0, 20)).to.be.deep.equal(new Uint8Array([...dataLength20]));
        expect(padding.addPadding(dataLength20, 16)[31]).to.be.equal(12);
    });

    it('remove padding', () => {
        const dataLength15 = randomBytes(15);
        const dataLength16 = randomBytes(16);
        const dataLength20 = randomBytes(20);
        expect(padding.removePadding(new Uint8Array([...dataLength15, 1]))).to.be.deep.equal(dataLength15);
        expect(padding.removePadding(new Uint8Array([...dataLength16, ...randomBytes(15), 16]))).to.be.deep.equal(dataLength16);
        expect(padding.removePadding(new Uint8Array([...dataLength20, ...randomBytes(11), 12]))).to.be.deep.equal(dataLength20);
    });

    it('add and remove padding', () => {
        for (let i = 1; i < 16; i++) {
            for (let j = 0; j <= i; j++) {
                const data = randomBytes(j);
                const paddedData = padding.addPadding(data, i);
                expect(paddedData.length % i).to.be.equal(0);
                const unpaddedData = padding.removePadding(paddedData);
                expect(unpaddedData).to.be.deep.equal(data);
            }
        }
    });
});
