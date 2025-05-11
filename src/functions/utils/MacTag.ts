import { BytesCoder, HMAC } from '@stevenkellner/typescript-common-functionality';

export class MacTag {

    private readonly messageAuthenticater: HMAC;

    public constructor(key: Uint8Array) {
        this.messageAuthenticater = new HMAC(key);
    }

    public create(parameters: unknown): string {
        const tagBytes = this.messageAuthenticater.sign(this.encodeParameters(parameters));
        return BytesCoder.toHex(tagBytes);
    }

    public verified(tag: string, parameters: unknown): boolean {
        return this.messageAuthenticater.verify(
            this.encodeParameters(parameters),
            BytesCoder.fromHex(tag)
        );
    }

    private encodeParameters(parameters: unknown): Uint8Array {
        const jsonString = parameters === undefined ? '' : JSON.stringify(parameters);
        return BytesCoder.fromUtf8(jsonString);
    }
}
