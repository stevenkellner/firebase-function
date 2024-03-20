import type { IHasher } from './IHasher';
import { sha512 } from 'sha512-crypt-ts';

export class Sha512HexEncoding implements IHasher {

    public constructor(
        private readonly uppercase: boolean = false
    ) {}

    public hash(value: string, hmacKey: string | null = null): string {
        sha512.setHexCase(this.uppercase);
        if (hmacKey !== null)
            return sha512.hexHmac(hmacKey, value);
        return sha512.hex(value);
    }
}
