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
}
