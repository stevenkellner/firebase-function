import { randomBytes } from 'crypto';
import type { IModeOfOperation } from './IModeOfOperation';
import { xor } from '../xor';

export class OFBMode implements IModeOfOperation {

    private initializationVector: Uint8Array | null = null;

    public startEncryption(): Uint8Array {
        this.initializationVector = randomBytes(16);
        return this.initializationVector;
    }

    public combineEncryption(block: Uint8Array, encrypt: (block: Uint8Array) => Uint8Array): Uint8Array {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const encrypted = xor(this.initializationVector!, encrypt(block));
        this.initializationVector = encrypted;
        return encrypted;
    }

    public finishEncryption(): Uint8Array {
        this.initializationVector = null;
        return new Uint8Array();
    }

    public startDecryption(): Uint8Array {
        this.initializationVector = null;
        return new Uint8Array();
    }

    public combineDecryption(block: Uint8Array, decrypt: (block: Uint8Array) => Uint8Array): Uint8Array {
        if (this.initializationVector === null) {
            this.initializationVector = block;
            return new Uint8Array();
        }
        const decrypted = decrypt(xor(this.initializationVector, block));
        this.initializationVector = block;
        return decrypted;
    }

    public finishDecryption(): Uint8Array {
        this.initializationVector = null;
        return new Uint8Array();
    }
}
