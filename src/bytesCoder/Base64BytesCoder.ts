import type { IBytesCoder } from './IBytesCoder';

export class Base64BytesCoder implements IBytesCoder<string> {

    public encode(data: string): Uint8Array {
        return Buffer.from(data, 'base64');
    }

    public decode(data: Uint8Array): string {
        return Buffer.from(data).toString('base64');
    }
}
