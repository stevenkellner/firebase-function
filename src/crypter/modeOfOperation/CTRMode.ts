import { randomBytes } from 'crypto';
import type { IModeOfOperation } from './IModeOfOperation';
import { xor } from '../xor';

export class CTRMode implements IModeOfOperation {

    private counter: Uint8Array | null = null;

    private incrementCounter(): void {
        for (let i = 15; i >= 0; i--) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (this.counter![i] !== 255) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.counter![i] += 1;
                break;
            } else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.counter![i] = 0;
                if (i === 0)
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.counter![15] = 0;
            }
        }
    }

    public startEncryption(): Uint8Array {
        this.counter = randomBytes(16);
        return new Uint8Array(this.counter);
    }

    public combineEncryption(block: Uint8Array, encrypt: (block: Uint8Array) => Uint8Array): Uint8Array {
        this.incrementCounter();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return xor(this.counter!, encrypt(block));
    }

    public finishEncryption(): Uint8Array {
        this.counter = null;
        return new Uint8Array();
    }

    public startDecryption(): Uint8Array {
        this.counter = null;
        return new Uint8Array();
    }

    public combineDecryption(block: Uint8Array, decrypt: (block: Uint8Array) => Uint8Array): Uint8Array {
        if (this.counter === null) {
            this.counter = new Uint8Array(block);
            return new Uint8Array();
        }
        this.incrementCounter();
        const decrypted = decrypt(xor(this.counter, block));
        return decrypted;
    }

    public finishDecryption(): Uint8Array {
        this.counter = null;
        return new Uint8Array();
    }
}
