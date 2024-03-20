import { Block } from 'aes-ts';
import { ICrypter } from './ICrypter';
import { CBCMode, type IModeOfOperation } from './modeOfOperation';
import { PKCS7Padding, type IPadding } from './padding';

export class AES extends ICrypter {

    private readonly blockCrypter: Block;

    private readonly modeOfOperation: IModeOfOperation;

    protected readonly blockSize = 16;

    public constructor(
        key: Uint8Array,
        modeOfOperation: IModeOfOperation | null = null,
        padding: IPadding = new PKCS7Padding()
    ) {
        super(padding);
        this.modeOfOperation = modeOfOperation ?? new CBCMode();
        if (key.length !== 16 && key.length !== 24 && key.length !== 32)
            throw new Error('AES key must be 16, 24 or 32 bytes long.');
        this.blockCrypter = new Block(key);
    }

    protected encryptBlocks(data: Uint8Array): Uint8Array {
        let encrypted = this.modeOfOperation.startEncryption();
        for (let i = 0; i < data.length / 16; i++) {
            const encryptedBlock = this.modeOfOperation.combineEncryption(data.slice(16 * i, 16 * (i + 1)), block => this.blockCrypter.encrypt(block));
            encrypted = new Uint8Array([...encrypted, ...encryptedBlock]);
        }
        return new Uint8Array([...encrypted, ...this.modeOfOperation.finishEncryption()]);
    }

    protected decryptBlocks(data: Uint8Array): Uint8Array {
        let decrypted = this.modeOfOperation.startDecryption();
        for (let i = 0; i < data.length / 16; i++) {
            const decryptedBlock = this.modeOfOperation.combineDecryption(data.slice(16 * i, 16 * (i + 1)), block => this.blockCrypter.decrypt(block));
            decrypted = new Uint8Array([...decrypted, ...decryptedBlock]);
        }
        return new Uint8Array([...decrypted, ...this.modeOfOperation.finishDecryption()]);
    }
}
