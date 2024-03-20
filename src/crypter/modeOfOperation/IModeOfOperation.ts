export interface IModeOfOperation {

    startEncryption(): Uint8Array;

    combineEncryption(block: Uint8Array, encrypt: (block: Uint8Array) => Uint8Array): Uint8Array;

    finishEncryption(): Uint8Array;

    startDecryption(): Uint8Array;

    combineDecryption(block: Uint8Array, decrypt: (block: Uint8Array) => Uint8Array): Uint8Array;

    finishDecryption(): Uint8Array;
}
