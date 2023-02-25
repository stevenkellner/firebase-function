import { RandomBitIterator } from './RandomBitIterator';
import { type FixedLength } from './FixedLength';
import { BytesToBitIterator } from './BytesToBitIterator';
import { CombineIterator } from './CombineIterator';
import { bitIteratorToBytes, randomBytes, xor, unishortBytes, unishortString, addPadding, removePadding } from './utils';
import { CBCEncryptor, CBCDecryptor } from 'aes-ts';
import { sha512 as crypt_sha512 } from 'sha512-crypt-ts';

export class Crypter {
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

    public decryptDecode(data: ''): undefined;
    public decryptDecode<T = unknown>(data: string): T;
    public decryptDecode<T = unknown>(data: string): T | undefined {
        if (data === '') return undefined;
        const dataBytes = unishortBytes(data);
        const decryptedData = this.decryptAesAndVernam(dataBytes);
        return JSON.parse(unishortString(decryptedData));
    }

    public encodeEncrypt(data: unknown): string {
        const encodedData = JSON.stringify(data);
        const dataBytes = unishortBytes(encodedData ?? '');
        const encryptedData = this.encryptVernamAndAes(dataBytes);
        return unishortString(encryptedData);
    }
}

export namespace Crypter {
    export interface Keys {
        encryptionKey: FixedLength<Uint8Array, 32>;
        initialisationVector: FixedLength<Uint8Array, 16>;
        vernamKey: FixedLength<Uint8Array, 32>;
    }

    export function sha512(value: string, key?: string): string {
        const hashedValue = key === undefined ? crypt_sha512.base64(value) : crypt_sha512.base64Hmac(key, value);
        return hashedValue.replaceAll('/', '_');
    }
}
