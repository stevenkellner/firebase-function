import { ICrypter, PKCS7Padding } from '../../src';

export class IdentityCrypter extends ICrypter {

    protected blockSize = 16;

    public constructor() {
        super(new PKCS7Padding());
    }

    protected encryptBlocks(data: Uint8Array): Uint8Array {
        return data;
    }

    protected decryptBlocks(data: Uint8Array): Uint8Array {
        return data;
    }
}
