import type { IHasher } from './IHasher';
import { sha512 } from 'sha512-crypt-ts';

export class Sha512CustomEncoding implements IHasher {

    public constructor(
        private readonly alphabet: string
    ) {}

    public hash(value: string, hmacKey: string | null = null): string {
        if (hmacKey !== null)
            return sha512.anyHmac(hmacKey, value, this.alphabet);
        return sha512.any(value, this.alphabet);
    }
}
