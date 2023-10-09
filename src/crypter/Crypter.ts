import { CBCDecryptor, CBCEncryptor } from 'aes-ts';
import { addPadding, bitIteratorToBytes, randomBytes, removePadding, unishortBytes, unishortString, xor } from './utils';
import { Base64 } from 'js-base64';
import { BytesToBitIterator } from './BytesToBitIterator';
import { CombineIterator } from './CombineIterator';
import type { FixedLength } from './FixedLength';
import type { ICrypter } from './ICrypter';
import { RandomBitIterator } from './RandomBitIterator';

export class Crypter implements ICrypter {
    public constructor(
        private readonly cryptionKeys: Crypter.Keys
    ) {}

    public encryptAes(bytes: Uint8Array): Uint8Array {
        const encrypter = new CBCEncryptor(this.cryptionKeys.encryptionKey.value, this.cryptionKeys.initialisationVector.value);
        return encrypter.encrypt(addPadding(bytes));
    }

    public decryptAes(bytes: Uint8Array): Uint8Array {
        const decrypter = new CBCDecryptor(this.cryptionKeys.encryptionKey.value, this.cryptionKeys.initialisationVector.value);
        return removePadding(decrypter.decrypt(bytes));
    }

    public encryptVernamCipher(bytes: Uint8Array): Uint8Array {
        const key = randomBytes(32);
        const randomBitIterator = new RandomBitIterator(Uint8Array.from([...key, ...this.cryptionKeys.vernamKey.value]));
        const bytesToBitIterator = new BytesToBitIterator(bytes);
        const combineIterator = new CombineIterator(randomBitIterator, bytesToBitIterator, xor);
        return Uint8Array.from([...key, ...bitIteratorToBytes(combineIterator)]);
    }

    public decryptVernamCipher(bytes: Uint8Array): Uint8Array {
        const randomBitIterator = new RandomBitIterator(Uint8Array.from([...bytes.slice(0, 32), ...this.cryptionKeys.vernamKey.value]));
        const bytesToBitIterator = new BytesToBitIterator(bytes.slice(32));
        const combineIterator = new CombineIterator(randomBitIterator, bytesToBitIterator, xor);
        return bitIteratorToBytes(combineIterator);
    }

    public encryptVernamAndAes(bytes: Uint8Array): Uint8Array {
        const vernamEncrypted = this.encryptVernamCipher(bytes);
        return this.encryptAes(vernamEncrypted);
    }

    public decryptAesAndVernam(bytes: Uint8Array): Uint8Array {
        const aesDecrypted = this.decryptAes(bytes);
        return this.decryptVernamCipher(aesDecrypted);
    }

    public encodeEncrypt(data: unknown): string {
        const decodedData = JSON.stringify(data) as string | undefined;
        const dataBytes = unishortBytes(decodedData ?? '');
        const encryptedData = this.encryptVernamAndAes(dataBytes);
        return Base64.fromUint8Array(encryptedData, true);
    }

    public decryptDecode(data: ''): null;
    public decryptDecode<T = unknown>(data: string): T;
    public decryptDecode<T = unknown>(data: string): T | null {
        if (data === '')
            return null;
        const dataBytes = Base64.toUint8Array(data);
        const decryptedData = this.decryptAesAndVernam(dataBytes);
        const decodedData = unishortString(decryptedData);
        return JSON.parse(decodedData) as T;
    }
}

export namespace Crypter {
    export interface Keys {
        encryptionKey: FixedLength<Uint8Array, 32>;
        initialisationVector: FixedLength<Uint8Array, 16>;
        vernamKey: FixedLength<Uint8Array, 32>;
    }
}
