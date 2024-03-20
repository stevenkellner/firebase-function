import type { IBytesCoder } from './IBytesCoder';

export class Utf8BytesCoder implements IBytesCoder<string> {

    public encode(data: string): Uint8Array {
        return Buffer.from(data, 'utf8');
    }

    public decode(data: Uint8Array): string {
        return Buffer.from(data).toString('utf8');
    }
}
