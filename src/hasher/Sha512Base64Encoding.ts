import type { IHasher } from './IHasher';
import { sha512 } from 'sha512-crypt-ts';

export class Sha512Base64Encoding implements IHasher {

    public constructor(
        private readonly padding: string = ''
    ) {}

    public hash(value: string, hmacKey: string | null = null): string {
        sha512.setBase64Padding(this.padding);
        if (hmacKey !== null)
            return sha512.base64Hmac(hmacKey, value);
        return sha512.base64(value);
    }
}
