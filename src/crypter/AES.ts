import { Block } from 'aes-ts';
import type { ICrypter } from './ICrypter';
import type { IModeOfOperation } from './modeOfOperation';

export class AES implements ICrypter {

    private readonly blockCrypter: Block;

    public constructor(
        key: Uint8Array,
        private readonly modeOfOperation: IModeOfOperation
    ) {
        if (key.length !== 16 && key.length !== 24 && key.length !== 32)
            throw new Error('AES key must be 16, 24 or 32 bytes long.');
        this.blockCrypter = new Block(key);
    }

    public encrypt(data: Uint8Array): Uint8Array {
        if (data.length % 16 !== 0)
            throw new Error('Data to encrypt must be a multiple of 16 bytes long.');
        let encrypted = this.modeOfOperation.startEncryption();
        for (let i = 0; i < data.length / 16; i++) {
            const encryptedBlock = this.modeOfOperation.combineEncryption(data.slice(16 * i, 16 * (i + 1)), block => this.blockCrypter.encrypt(block));
            encrypted = new Uint8Array([...encrypted, ...encryptedBlock]);
        }
        return new Uint8Array([...encrypted, ...this.modeOfOperation.finishEncryption()]);
    }

    public decrypt(data: Uint8Array): Uint8Array {
        if (data.length % 16 !== 0)
            throw new Error('Data to decrypt must be a multiple of 16 bytes long.');
        let decrypted = this.modeOfOperation.startDecryption();
        for (let i = 0; i < data.length / 16; i++) {
            const decryptedBlock = this.modeOfOperation.combineDecryption(data.slice(16 * i, 16 * (i + 1)), block => this.blockCrypter.decrypt(block));
            decrypted = new Uint8Array([...decrypted, ...decryptedBlock]);
        }
        return new Uint8Array([...decrypted, ...this.modeOfOperation.finishDecryption()]);
    }
}
