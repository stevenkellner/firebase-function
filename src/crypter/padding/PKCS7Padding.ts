import type { IPadding } from './IPadding';

export class PKCS7Padding implements IPadding {

    public addPadding(data: Uint8Array, blockSize: number): Uint8Array {
        const paddingLength = blockSize - data.length % blockSize;
        return new Uint8Array([...data, ...new Array<number>(paddingLength).fill(paddingLength)]);
    }

    public removePadding(data: Uint8Array): Uint8Array {
        const paddingLength = data[data.length - 1];
        return data.slice(0, data.length - paddingLength);
    }
}
