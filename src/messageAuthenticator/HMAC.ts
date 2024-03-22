import { xor } from '../crypter';
import { Sha512, type IHasher } from '../hasher';
import type { IMessageAuthenticator } from './IMessageAuthenticator';

export class HMAC implements IMessageAuthenticator {

    public constructor(
        private readonly key: Uint8Array,
        private readonly hasher: IHasher = new Sha512()
    ) {}

    public sign(message: Uint8Array): Uint8Array {
        const hashedKey = this.hasher.hash(this.key);
        const opad = new Uint8Array(hashedKey.length).fill(0x5C);
        const ipad = new Uint8Array(hashedKey.length).fill(0x36);
        return this.hasher.hash(new Uint8Array([...xor(hashedKey, opad), ...this.hasher.hash(xor(hashedKey, ipad)), ...message]));
    }

    public verify(message: Uint8Array, tag: Uint8Array): boolean {
        const expectedTag = this.sign(message);
        if (tag.length !== expectedTag.length)
            return false;
        for (let i = 0; i < tag.length; i++) {
            if (tag[i] !== expectedTag[i])
                return false;
        }
        return true;
    }
}
