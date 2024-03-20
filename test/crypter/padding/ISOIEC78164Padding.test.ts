import { randomBytes } from 'crypto';
import { ISOIEC7864Padding } from '../../../src';
import { expect } from '../../../testSrc';

describe('ISOIEC7864Padding', () => {
    const padding = new ISOIEC7864Padding();

    it('add padding', () => {
        const dataLength15 = randomBytes(15);
        const dataLength16 = randomBytes(16);
        const dataLength20 = randomBytes(20);
        expect(padding.addPadding(dataLength15, 16)).to.be.deep.equal(new Uint8Array([...dataLength15, 0x80]));
        expect(padding.addPadding(dataLength16, 16)).to.be.deep.equal(new Uint8Array([...dataLength16, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
        expect(padding.addPadding(dataLength20, 16)).to.be.deep.equal(new Uint8Array([...dataLength20, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    });

    it('remove padding', () => {
        const dataLength15 = randomBytes(15);
        const dataLength16 = randomBytes(16);
        const dataLength20 = randomBytes(20);
        expect(padding.removePadding(new Uint8Array([...dataLength15, 0x80]))).to.be.deep.equal(dataLength15);
        expect(padding.removePadding(new Uint8Array([...dataLength16, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))).to.be.deep.equal(dataLength16);
        expect(padding.removePadding(new Uint8Array([...dataLength20, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))).to.be.deep.equal(dataLength20);
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
