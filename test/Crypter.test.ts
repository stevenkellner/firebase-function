import { expect } from 'chai';
import { PseudoRandom } from '../src/crypter/PseudoRandom';
import { BytesToBitIterator } from '../src/crypter/BytesToBitIterator';
import { bits, xor, bitIteratorToBytes, addPadding, removePadding } from '../src/crypter/utils';
import { RandomBitIterator } from '../src/crypter/RandomBitIterator';
import { CombineIterator } from '../src/crypter/CombineIterator';
import { Crypter } from '../src/crypter/Crypter';
import { FixedLength } from '../src/crypter/FixedLength';
import * as crypterTestData from './dataset/crypterTestData.json';
import { Base64 } from 'js-base64';

describe('Crypter', () => {
    describe('PseudoRandom', () => {
        it('random byte', () => {
            const pseudoRandom = new PseudoRandom(Uint8Array.from([0x1e, 0x33, 0x43, 0xe0, 0x25, 0x3a, 0xb5, 0xa0, 0xf9, 0x0d, 0x33, 0x95, 0x10, 0xaa, 0x7d, 0xee]));
            const expectedBytes = [223, 151, 156, 50, 123, 196, 29, 177, 74, 148, 156, 220, 244, 146, 22, 131, 21, 111, 117, 65, 23, 89, 254, 68, 206, 148, 185, 154, 156, 29, 165, 91];
            for (const expectedByte of expectedBytes)
                expect(pseudoRandom.randomByte()).to.be.equal(expectedByte);
        });
    });

    describe('utils', () => {
        it('bits', () => {
            const dataset: Array<[number, Array<0 | 1>]> = [
                [0x00, [0, 0, 0, 0, 0, 0, 0, 0]],
                [0x01, [0, 0, 0, 0, 0, 0, 0, 1]],
                [0x4e, [0, 1, 0, 0, 1, 1, 1, 0]],
                [0xff, [1, 1, 1, 1, 1, 1, 1, 1]]
            ];
            for (const data of dataset)
                expect(bits(data[0])).to.be.deep.equal(data[1]);
        });

        it('invalid bits', () => {
            try {
                bits(0x111);
                expect.fail('Expect error thrown');
            } catch (error) {
                expect(error).to.have.ownProperty('message');
                expect((error as { message: unknown }).message).to.be.equal('Value isn\'t a valid byte.');
            }
        });

        it('xor', () => {
            expect(xor(0, 0)).to.be.equal(0);
            expect(xor(1, 1)).to.be.equal(0);
            expect(xor(0, 1)).to.be.equal(1);
            expect(xor(1, 0)).to.be.equal(1);
        });

        it('bitIteratorToBuffer 1', () => {
            const bitIterator: Iterator<0 | 1> = ([] as Array<0 | 1>)[Symbol.iterator]();
            const buffer = bitIteratorToBytes(bitIterator);
            const expectedBuffer = Uint8Array.from([]);
            expect(buffer).to.be.deep.equal(expectedBuffer);
        });

        it('bitIteratorToBuffer 2', () => {
            const bitIterator: Iterator<0 | 1> = ([0, 0, 1, 0, 0, 0, 1, 1] as Array<0 | 1>)[Symbol.iterator]();
            const buffer = bitIteratorToBytes(bitIterator);
            const expectedBuffer = Uint8Array.from([0x23]);
            expect(buffer).to.be.deep.equal(expectedBuffer);
        });

        it('bitIteratorToBuffer 3', () => {
            const bitIterator: Iterator<0 | 1> = ([
                0, 0, 1, 0, 0, 0, 1, 1,
                0, 1, 0, 0, 0, 1, 0, 1,
                0, 1, 1, 0, 0, 1, 1, 1,
                1, 0, 1, 0, 1, 1, 1, 1
            ] as Array<0 | 1>)[Symbol.iterator]();
            const buffer = bitIteratorToBytes(bitIterator);
            const expectedBuffer = Uint8Array.from([0x23, 0x45, 0x67, 0xaf]);
            expect(buffer).to.be.deep.equal(expectedBuffer);
        });
    });

    describe('BufferToBitIterator', () => {
        it('buffer to bits 1', () => {
            const buffer = Uint8Array.from([]);
            const bufferToBitIterator = new BytesToBitIterator(buffer);
            const expectedBits: Array<0 | 1> = [];
            let bitResult = bufferToBitIterator.next();
            let index = 0;
            while (!(bitResult.done ?? false)) {
                expect(bitResult.value).to.be.equal(expectedBits[index]);
                bitResult = bufferToBitIterator.next();
                index += 1;
            }
        });

        it('buffer to bits 2', () => {
            const buffer = Uint8Array.from([0x23]);
            const bufferToBitIterator = new BytesToBitIterator(buffer);
            const expectedBits: Array<0 | 1> = [0, 0, 1, 0, 0, 0, 1, 1];
            let bitResult = bufferToBitIterator.next();
            let index = 0;
            while (!(bitResult.done ?? false)) {
                expect(bitResult.value).to.be.equal(expectedBits[index]);
                bitResult = bufferToBitIterator.next();
                index += 1;
            }
        });

        it('buffer to bits 3', () => {
            const buffer = Uint8Array.from([0x23, 0x45, 0x67, 0xaf]);
            const bufferToBitIterator = new BytesToBitIterator(buffer);
            const expectedBits: Array<0 | 1> = [
                0, 0, 1, 0, 0, 0, 1, 1,
                0, 1, 0, 0, 0, 1, 0, 1,
                0, 1, 1, 0, 0, 1, 1, 1,
                1, 0, 1, 0, 1, 1, 1, 1
            ];
            let bitResult = bufferToBitIterator.next();
            let index = 0;
            while (!(bitResult.done ?? false)) {
                expect(bitResult.value).to.be.equal(expectedBits[index]);
                bitResult = bufferToBitIterator.next();
                index += 1;
            }
        });
    });

    describe('RandomBitIterator', () => {
        it('random bits', () => {
            const randomBitIterator = new RandomBitIterator(Uint8Array.from([0x1e, 0x33, 0x43, 0xe0, 0x25, 0x3a, 0xb5, 0xa0, 0xf9, 0x0d, 0x33, 0x95, 0x10, 0xaa, 0x7d, 0xee]));
            const expectedBits = [
                1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0,
                0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1
            ];
            for (const expectedBit of expectedBits)
                expect(randomBitIterator.next().value).to.be.equal(expectedBit);
        });
    });

    describe('CombineIterator', () => {
        it('combine 1', () => {
            const iterator1 = [1, 2, 3][Symbol.iterator]();
            const iterator2 = [4, 5, 6][Symbol.iterator]();
            const combineIterator = new CombineIterator(iterator1, iterator2, (e1, e2) => [e1, e2] as [number, number]);
            const expectedData: Array<[number, number]> = [[1, 4], [2, 5], [3, 6]];
            for (const expected of expectedData)
                expect(combineIterator.next().value).to.be.deep.equal(expected);
        });

        it('combine 1', () => {
            const iterator1 = [1, 2][Symbol.iterator]();
            const iterator2 = [4, 5, 6][Symbol.iterator]();
            const combineIterator = new CombineIterator(iterator1, iterator2, (e1, e2) => [e1, e2] as [number, number]);
            const expectedData: Array<[number, number]> = [[1, 4], [2, 5]];
            for (const expected of expectedData)
                expect(combineIterator.next().value).to.be.deep.equal(expected);
        });

        it('combine 1', () => {
            const iterator1 = [1, 2, 3][Symbol.iterator]();
            const iterator2 = [4, 5][Symbol.iterator]();
            const combineIterator = new CombineIterator(iterator1, iterator2, (e1, e2) => [e1, e2] as [number, number]);
            const expectedData: Array<[number, number]> = [[1, 4], [2, 5]];
            for (const expected of expectedData)
                expect(combineIterator.next().value).to.be.deep.equal(expected);
        });
    });

    describe('Crypter', () => {
        const cryptionKeys: Crypter.Keys = {
            encryptionKey: new FixedLength(Uint8Array.from([0x37, 0xe6, 0x91, 0x57, 0xda, 0xc0, 0x1c, 0x0a, 0x9c, 0x93, 0xea, 0x1c, 0x72, 0x10, 0x41, 0xe6, 0x26, 0x86, 0x94, 0x3f, 0xda, 0x9d, 0xab, 0x30, 0xf7, 0x56, 0x5e, 0xdb, 0x3e, 0xf1, 0x5f, 0x5b]), 32),
            initialisationVector: new FixedLength(Uint8Array.from([0x69, 0x29, 0xd3, 0xdc, 0x8d, 0xd4, 0x1c, 0x90, 0x81, 0x2e, 0x30, 0x2a, 0x4b, 0x01, 0x03, 0x78]), 16),
            vernamKey: new FixedLength(Uint8Array.from([0x9f, 0x10, 0x2b, 0x4b, 0x5f, 0x0b, 0x5c, 0x50, 0x82, 0xd2, 0xa7, 0xbb, 0x7c, 0x7f, 0x13, 0x9f, 0xed, 0x6a, 0x99, 0x5e, 0xcf, 0x1f, 0x28, 0x80, 0x94, 0x20, 0x3c, 0xc3, 0x92, 0xf9, 0x6b, 0x5e]), 32)
        };
        const crypter = new Crypter(cryptionKeys);

        it('aes encrypt', () => {
            const originalBytes = Uint8Array.from(crypterTestData.aesOriginal);
            const encryptedBytes = crypter.encryptAes(originalBytes);
            const expectedEncryptedBytes = Uint8Array.from(crypterTestData.aesEncrypted);
            expect(encryptedBytes).to.be.deep.equal(expectedEncryptedBytes);
        });

        it('aes decrypt', () => {
            const encryptedBytes = Uint8Array.from(crypterTestData.aesEncrypted);
            const originalBytes = crypter.decryptAes(encryptedBytes);
            const expectedOriginalBytes = Uint8Array.from(crypterTestData.aesOriginal);
            expect(originalBytes).to.be.deep.equal(expectedOriginalBytes);
        });

        it('aes encrypt and decrypt', () => {
            const originalBytes = Uint8Array.from(crypterTestData.aesOriginal);
            const encryptedBytes = crypter.encryptAes(originalBytes);
            const decryptedBytes = crypter.decryptAes(encryptedBytes);
            expect(decryptedBytes).to.be.deep.equal(originalBytes);
        });

        it('vernam decrypt', () => {
            const encryptedBytes = Uint8Array.from(crypterTestData.vernamEncrypted);
            const originalBytes = crypter.decryptVernamCipher(encryptedBytes);
            const expectedOriginalBytes = Uint8Array.from(crypterTestData.vernamOriginal);
            expect(originalBytes).to.be.deep.equal(expectedOriginalBytes);
        });

        it('vernam encrypt and decrypt', () => {
            const originalBytes = Uint8Array.from(crypterTestData.vernamOriginal);
            const encryptedBytes = crypter.encryptVernamCipher(originalBytes);
            const decryptedBytes = crypter.decryptVernamCipher(encryptedBytes);
            expect(decryptedBytes).to.be.deep.equal(originalBytes);
        });

        it('aes vernam decrypt', () => {
            const encryptedBytes = Uint8Array.from(crypterTestData.aesVernamEncrypted);
            const originalBytes = crypter.decryptAesAndVernam(encryptedBytes);
            const expectedOriginalBytes = Uint8Array.from(crypterTestData.aesVernamOriginal);
            expect(originalBytes).to.be.deep.equal(expectedOriginalBytes);
        });

        it('aes vernam encrypt and decrypt', () => {
            const originalBytes = Uint8Array.from(crypterTestData.aesVernamOriginal);
            const encryptedBytes = crypter.encryptVernamAndAes(originalBytes);
            const decryptedBytes = crypter.decryptAesAndVernam(encryptedBytes);
            expect(decryptedBytes).to.be.deep.equal(originalBytes);
        });

        it('decrypt decode', () => {
            const encrypted = Base64.fromUint8Array(Uint8Array.from(crypterTestData.encodedEncrypted), true);
            const decrypted = crypter.decryptDecode(encrypted);
            expect(decrypted).to.be.equal(crypterTestData.decryptedDecoded);
        });

        it('decrypt decode and encode encrypt', () => {
            const encrypted = crypter.encodeEncrypt(crypterTestData.decryptedDecoded);
            const decrypted = crypter.decryptDecode(encrypted);
            expect(decrypted).to.be.equal(crypterTestData.decryptedDecoded);
        });

        it('decrypt decode emtpy string', () => {
            expect(crypter.decryptDecode('')).to.be.undefined;
        });
    });

    describe('FixedLength', () => {
        it('length 16 valid', () => {
            expect(new FixedLength('abcdefghijklmnop', 16).value).to.be.equal('abcdefghijklmnop');
        });

        it('length 16 not length 16', () => {
            try {
                // eslint-disable-next-line no-new
                new FixedLength('a', 16);
            } catch (error) {
                expect(error).to.have.ownProperty('message');
                expect((error as { message: unknown }).message).to.be.equal('Expected value to has length 16.');
                return;
            }
            expect.fail('Expect throw');
        });
    });

    describe('Padding', () => {
        const cryptionKeys: Crypter.Keys = {
            encryptionKey: new FixedLength(Uint8Array.from([0x37, 0xe6, 0x91, 0x57, 0xda, 0xc0, 0x1c, 0x0a, 0x9c, 0x93, 0xea, 0x1c, 0x72, 0x10, 0x41, 0xe6, 0x26, 0x86, 0x94, 0x3f, 0xda, 0x9d, 0xab, 0x30, 0xf7, 0x56, 0x5e, 0xdb, 0x3e, 0xf1, 0x5f, 0x5b]), 32),
            initialisationVector: new FixedLength(Uint8Array.from([0x69, 0x29, 0xd3, 0xdc, 0x8d, 0xd4, 0x1c, 0x90, 0x81, 0x2e, 0x30, 0x2a, 0x4b, 0x01, 0x03, 0x78]), 16),
            vernamKey: new FixedLength(Uint8Array.from([0x9f, 0x10, 0x2b, 0x4b, 0x5f, 0x0b, 0x5c, 0x50, 0x82, 0xd2, 0xa7, 0xbb, 0x7c, 0x7f, 0x13, 0x9f, 0xed, 0x6a, 0x99, 0x5e, 0xcf, 0x1f, 0x28, 0x80, 0x94, 0x20, 0x3c, 0xc3, 0x92, 0xf9, 0x6b, 0x5e]), 32)
        };
        const crypter = new Crypter(cryptionKeys);

        const dataset: Array<[Uint8Array, Uint8Array]> = [
            [new Uint8Array([170, 75, 61, 13, 14, 114, 106, 162, 157, 106, 126, 148, 10, 146, 237, 38, 199, 130, 112, 181, 249, 177, 47, 41, 112, 28, 203, 146, 49, 166, 30, 53]), new Uint8Array([137, 242, 23, 251, 185, 141, 78, 137, 169, 184, 72, 54, 117, 155, 168, 31, 68, 74, 236, 230, 177, 33, 150, 95, 96, 144, 35, 94, 71, 228, 9, 189, 86, 3, 123, 136, 217, 27, 215, 47, 196, 45, 172, 50, 42, 3, 58, 247])],
            [new Uint8Array([168, 30, 249, 191, 240, 106, 114, 72, 35, 10, 48, 21, 136, 177, 81, 212, 206, 176, 48, 251, 55, 24, 17, 224, 229, 106, 220, 152, 189, 65, 83, 174, 39]), new Uint8Array([207, 221, 188, 9, 133, 81, 139, 62, 131, 48, 232, 110, 211, 143, 141, 109, 80, 89, 196, 7, 45, 137, 158, 81, 239, 184, 2, 237, 59, 51, 4, 155, 144, 38, 117, 186, 224, 157, 241, 252, 253, 241, 10, 93, 221, 115, 41, 8])],
            [new Uint8Array([2, 55, 148, 101, 113, 236, 77, 94, 211, 55, 39, 84, 162, 55, 142, 175, 129, 58, 1, 246, 2, 195, 186, 161, 5, 176, 172, 115, 211, 202, 80, 193, 45, 22]), new Uint8Array([125, 147, 213, 174, 101, 244, 238, 247, 116, 61, 107, 180, 133, 103, 173, 198, 13, 108, 249, 113, 173, 36, 118, 145, 140, 115, 230, 7, 34, 227, 198, 152, 130, 254, 49, 232, 226, 57, 141, 97, 22, 66, 98, 105, 169, 140, 155, 125])],
            [new Uint8Array([44, 102, 120, 185, 109, 133, 239, 153, 163, 4, 90, 54, 148, 60, 27, 135, 100, 68, 231, 82, 25, 29, 63, 145, 153, 72, 14, 138, 96, 213, 79, 53, 114, 150, 99]), new Uint8Array([121, 187, 241, 234, 236, 202, 208, 120, 220, 135, 193, 200, 15, 75, 166, 247, 172, 165, 86, 46, 154, 28, 20, 187, 153, 82, 236, 48, 92, 13, 40, 93, 44, 214, 101, 183, 36, 3, 52, 88, 254, 229, 247, 34, 234, 222, 138, 194])],
            [new Uint8Array([1, 89, 120, 187, 120, 226, 85, 175, 103, 79, 181, 51, 95, 161, 87, 245, 192, 125, 108, 69, 71, 46, 12, 176, 28, 37, 7, 181, 188, 170, 168, 232, 61, 219, 238, 216]), new Uint8Array([95, 133, 103, 241, 183, 49, 232, 49, 35, 229, 197, 152, 199, 225, 23, 14, 110, 194, 152, 113, 193, 81, 80, 97, 88, 151, 156, 42, 31, 174, 142, 61, 153, 69, 98, 140, 126, 118, 47, 168, 29, 65, 190, 111, 121, 63, 36, 53])],
            [new Uint8Array([86, 100, 224, 248, 35, 8, 161, 27, 1, 94, 156, 223, 21, 154, 88, 252, 24, 226, 171, 156, 120, 53, 197, 214, 43, 246, 246, 232, 203, 209, 245, 46, 203, 50, 227, 205, 205]), new Uint8Array([17, 218, 6, 74, 130, 142, 194, 78, 113, 88, 81, 173, 45, 162, 248, 160, 6, 121, 250, 196, 73, 53, 158, 51, 192, 151, 29, 156, 235, 1, 215, 216, 200, 187, 55, 232, 193, 78, 111, 163, 28, 38, 52, 163, 223, 184, 166, 159])],
            [new Uint8Array([141, 238, 172, 234, 162, 82, 23, 248, 154, 248, 30, 7, 66, 141, 216, 46, 50, 224, 164, 201, 116, 109, 92, 243, 79, 10, 33, 226, 211, 249, 59, 54, 192, 37, 194, 132, 245, 79]), new Uint8Array([76, 206, 141, 103, 164, 214, 124, 39, 60, 170, 213, 209, 110, 11, 255, 125, 44, 198, 97, 142, 125, 223, 11, 238, 39, 88, 174, 132, 72, 42, 152, 122, 84, 84, 96, 70, 32, 167, 151, 191, 54, 113, 2, 56, 205, 193, 51, 22])],
            [new Uint8Array([102, 203, 201, 196, 232, 120, 234, 146, 96, 227, 133, 32, 94, 120, 29, 203, 101, 169, 51, 8, 215, 254, 251, 230, 3, 180, 130, 195, 51, 223, 133, 140, 120, 41, 243, 102, 37, 91, 139]), new Uint8Array([243, 162, 36, 206, 222, 194, 86, 95, 53, 12, 227, 120, 208, 69, 209, 56, 238, 153, 228, 6, 235, 240, 52, 170, 69, 242, 218, 135, 121, 248, 141, 26, 243, 225, 161, 213, 129, 79, 33, 43, 221, 242, 36, 69, 217, 55, 233, 46])],
            [new Uint8Array([230, 248, 78, 100, 142, 255, 84, 125, 133, 203, 150, 173, 12, 211, 65, 68, 14, 76, 98, 218, 227, 173, 140, 251, 180, 182, 10, 57, 254, 136, 185, 110, 46, 99, 146, 157, 21, 218, 181, 159]), new Uint8Array([71, 188, 156, 97, 100, 237, 28, 170, 5, 233, 11, 148, 1, 251, 59, 53, 171, 216, 128, 145, 238, 113, 105, 78, 6, 147, 89, 37, 90, 219, 227, 164, 87, 141, 76, 244, 54, 55, 183, 179, 204, 14, 1, 47, 227, 54, 111, 124])],
            [new Uint8Array([10, 83, 121, 140, 131, 150, 207, 171, 10, 246, 196, 181, 172, 189, 207, 37, 83, 159, 50, 101, 231, 242, 73, 52, 68, 16, 86, 107, 69, 197, 107, 135, 36, 213, 141, 83, 27, 149, 197, 50, 3]), new Uint8Array([56, 63, 226, 190, 100, 161, 177, 232, 195, 95, 233, 19, 246, 55, 243, 13, 220, 82, 71, 31, 98, 21, 183, 40, 211, 50, 9, 226, 20, 105, 45, 254, 241, 221, 154, 188, 19, 128, 111, 176, 199, 21, 126, 149, 27, 107, 60, 123])],
            [new Uint8Array([8, 92, 204, 211, 199, 129, 208, 80, 252, 194, 32, 252, 204, 152, 62, 227, 116, 150, 59, 210, 16, 68, 98, 215, 39, 201, 8, 52, 213, 80, 117, 255, 2, 189, 40, 119, 121, 150, 165, 193, 40, 33]), new Uint8Array([131, 208, 177, 101, 166, 189, 191, 251, 247, 11, 191, 17, 0, 52, 44, 122, 108, 239, 16, 50, 248, 226, 186, 171, 190, 84, 234, 22, 236, 154, 218, 105, 173, 126, 187, 124, 219, 102, 107, 32, 10, 31, 202, 51, 119, 33, 53, 136])],
            [new Uint8Array([131, 122, 34, 225, 156, 10, 7, 81, 67, 233, 243, 187, 231, 87, 113, 245, 192, 58, 32, 113, 149, 154, 65, 232, 218, 187, 204, 234, 53, 69, 77, 121, 74, 16, 164, 102, 251, 171, 122, 197, 188, 241, 185]), new Uint8Array([214, 179, 93, 86, 143, 50, 134, 147, 244, 131, 118, 92, 120, 193, 250, 196, 101, 176, 44, 20, 88, 163, 182, 44, 176, 198, 72, 48, 255, 76, 209, 16, 54, 46, 149, 62, 188, 248, 158, 244, 56, 89, 218, 193, 98, 31, 192, 92])],
            [new Uint8Array([212, 85, 180, 152, 197, 31, 125, 140, 235, 196, 34, 156, 48, 168, 157, 209, 117, 18, 191, 182, 48, 183, 173, 43, 199, 150, 57, 101, 54, 245, 212, 78, 9, 96, 204, 152, 193, 14, 94, 191, 194, 160, 153, 69]), new Uint8Array([191, 23, 106, 220, 173, 149, 141, 178, 212, 45, 43, 10, 150, 55, 80, 108, 122, 240, 197, 144, 157, 180, 192, 177, 127, 119, 171, 25, 230, 37, 213, 170, 115, 29, 220, 239, 59, 15, 163, 152, 162, 194, 90, 168, 73, 217, 119, 135])],
            [new Uint8Array([187, 167, 180, 149, 102, 241, 211, 194, 135, 164, 92, 245, 32, 100, 249, 19, 84, 177, 56, 0, 40, 28, 68, 243, 16, 180, 73, 39, 198, 226, 146, 59, 66, 66, 236, 157, 213, 140, 143, 88, 32, 64, 172, 167, 169]), new Uint8Array([139, 181, 86, 220, 247, 242, 115, 183, 220, 170, 201, 189, 26, 196, 71, 116, 238, 112, 48, 19, 175, 71, 116, 127, 41, 138, 151, 38, 32, 17, 1, 4, 254, 9, 176, 82, 237, 111, 54, 86, 91, 155, 244, 70, 244, 70, 12, 159])],
            [new Uint8Array([152, 253, 35, 230, 12, 20, 124, 183, 97, 204, 125, 156, 230, 122, 156, 234, 65, 221, 62, 171, 231, 222, 231, 44, 34, 70, 223, 174, 222, 125, 19, 69, 96, 165, 158, 187, 244, 113, 152, 217, 95, 34, 55, 109, 224, 40]), new Uint8Array([63, 181, 74, 27, 181, 113, 251, 180, 17, 35, 7, 3, 12, 99, 255, 87, 104, 166, 34, 7, 254, 229, 223, 203, 181, 172, 13, 174, 234, 181, 189, 27, 166, 159, 78, 66, 231, 182, 61, 169, 3, 222, 35, 98, 190, 199, 228, 226])],
            [new Uint8Array([45, 99, 69, 121, 62, 57, 50, 121, 60, 25, 105, 81, 71, 81, 150, 232, 9, 135, 160, 1, 212, 80, 76, 29, 39, 182, 252, 139, 202, 250, 28, 62, 26, 117, 155, 150, 100, 209, 210, 28, 192, 170, 222, 117, 182, 163, 122]), new Uint8Array([143, 206, 52, 15, 143, 81, 248, 167, 36, 7, 118, 123, 229, 37, 61, 246, 19, 15, 13, 104, 58, 221, 115, 3, 180, 172, 26, 12, 154, 86, 25, 74, 128, 170, 54, 215, 119, 27, 56, 153, 39, 176, 88, 44, 246, 24, 166, 100])]
        ];

        it('add remove padding', () => {
            for (let i = 0; i < 16; i++) {
                const original = new Uint8Array(32 + i);
                const withPadding = addPadding(original);
                expect(withPadding.length % 16).to.be.deep.equal(0);
                const withoutPadding = removePadding(withPadding);
                expect(withoutPadding).to.be.deep.equal(original);
            }
        });

        it('encrypt aes', () => {
            for (const data of dataset) {
                const actual = crypter.encryptAes(data[0]);
                expect(actual).to.be.deep.equal(data[1]);
            }
        });

        it('decrypt aes', () => {
            for (const data of dataset) {
                const actual = crypter.decryptAes(data[1]);
                expect(actual).to.be.deep.equal(data[0]);
            }
        });
    });

    it('hash', () => {
        expect(Crypter.sha512('lkjdasflnc')).to.be.equal('rbswGhojGpzw7EoB61dz3LpecUiFV7y0QHhO7xLHbgtPHhjsKxH6nbUg2p6B5CpSAa1hMzJKBfM8twldRbKj1g');
        expect(Crypter.sha512('lkjdasflnc', 'oimli')).to.be.equal('5NRfmNX8NnSCP2jrQIrhmkpo+wpz27FQDyU4_4lheOiJ8etSQ+spWak39WgaF8lzd8qwHzlkrfixZIZlf_1hSQ');
    });
});
