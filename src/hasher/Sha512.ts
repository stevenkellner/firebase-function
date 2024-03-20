import type { IHasher } from './IHasher';
import { Sha512Base64Encoding } from './Sha512Base64Encoding';
import { Sha512CustomEncoding } from './Sha512CustomEncoding';
import { Sha512HexEncoding } from './Sha512HexEncoding';

export class Sha512 implements IHasher {

    public constructor(
        private readonly type: 'hex' | { hexWithUppercase: boolean } | 'base64' | { base64WithPadding: string } | { alphabet: string } = 'base64'
    ) {}

    private get hasher(): IHasher {
        if (this.type === 'hex')
            return new Sha512HexEncoding();
        if (this.type === 'base64')
            return new Sha512Base64Encoding();
        if ('hexWithUppercase' in this.type)
            return new Sha512HexEncoding(this.type.hexWithUppercase);
        if ('base64WithPadding' in this.type)
            return new Sha512Base64Encoding(this.type.base64WithPadding);
        return new Sha512CustomEncoding(this.type.alphabet);
    }

    public hash(value: string, hmacKey: string | null = null): string {
        return this.hasher.hash(value, hmacKey);
    }
}
