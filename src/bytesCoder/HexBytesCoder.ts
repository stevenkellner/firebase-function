import type { IBytesCoder } from './IBytesCoder';

export class HexBytesCoder implements IBytesCoder<string> {

    public encode(data: string): Uint8Array {
        return Buffer.from(data, 'hex');
    }

    public decode(data: Uint8Array): string {
        return Buffer.from(data).toString('hex');
    }
}
