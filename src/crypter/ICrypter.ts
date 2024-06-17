import { Utf8BytesCoder } from '../bytesCoder';
import type { IPadding } from './padding';

export abstract class ICrypter {

    protected readonly abstract blockSize: number;

    public constructor(
        private readonly padding: IPadding
    ) {}

    protected abstract encryptBlocks(data: Uint8Array): Uint8Array;

    protected abstract decryptBlocks(data: Uint8Array): Uint8Array;

    public encrypt(data: Uint8Array): Uint8Array {
        const paddedData = this.padding.addPadding(data, this.blockSize);
        return this.encryptBlocks(paddedData);
    }

    public decrypt(data: Uint8Array): Uint8Array {
        const decryptedData = this.decryptBlocks(data);
        return this.padding.removePadding(decryptedData);
    }

    public encodeAndEncrypt(value: unknown): Uint8Array {
        const bytesCoder = new Utf8BytesCoder();
        const jsonString = value === undefined ? '' : JSON.stringify(value);
        const data = bytesCoder.encode(jsonString);
        return this.encrypt(data);
    }

    public decryptAndDecode<T = unknown>(data: Uint8Array): T {
        const decryptedData = this.decrypt(data);
        const bytesCoder = new Utf8BytesCoder();
        const value = bytesCoder.decode(decryptedData);
        return (value === '' ? undefined : JSON.parse(value)) as T;
    }
}
