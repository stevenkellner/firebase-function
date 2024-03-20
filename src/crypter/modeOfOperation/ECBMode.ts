import type { IModeOfOperation } from './IModeOfOperation';

export class ECBMode implements IModeOfOperation {

    public startEncryption(): Uint8Array {
        return new Uint8Array();
    }

    public combineEncryption(block: Uint8Array, encrypt: (block: Uint8Array) => Uint8Array): Uint8Array {
        return encrypt(block);
    }

    public finishEncryption(): Uint8Array {
        return new Uint8Array();
    }

    public startDecryption(): Uint8Array {
        return new Uint8Array();
    }

    public combineDecryption(block: Uint8Array, decrypt: (block: Uint8Array) => Uint8Array): Uint8Array {
        return decrypt(block);
    }

    public finishDecryption(): Uint8Array {
        return new Uint8Array();
    }
}
