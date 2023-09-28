import { webcrypto } from 'crypto';
import { sha512 as crypt_sha512 } from 'sha512-crypt-ts';

export function bits(byte: number): Array<0 | 1> {
    const totalBitsCount = 8;
    const bitsArray = Array<0 | 1>(totalBitsCount).fill(0);
    for (let index = 0; index < totalBitsCount; index++) {
        const bit = byte % 0x02;
        byte = (byte - bit) / 0x02;
        bitsArray[totalBitsCount - index - 1] = bit === 0 ? 0 : 1;
    }
    if (byte !== 0)
        throw new Error('Value isn\'t a valid byte.');
    return bitsArray;
}

export function xor(bit1: 0 | 1, bit2: 0 | 1): 0 | 1 {
    return bit1 === bit2 ? 0 : 1;
}

export function bitIteratorToBytes(iterator: Iterator<0 | 1>): Uint8Array {
    const bytes: number[] = [];
    let currentByte = 0;
    let index = 0;
    let iteratorResult = iterator.next();
    while (!(iteratorResult.done ?? false)) {
        currentByte += iteratorResult.value * (1 << (7 - index));
        iteratorResult = iterator.next();
        index += 1;
        if (index === 8) {
            bytes.push(currentByte);
            currentByte = 0;
            index = 0;
        }
    }
    return Uint8Array.from(bytes);
}

export function randomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    webcrypto.getRandomValues(bytes);
    return bytes;
}

export function unishortString(bytes: Uint8Array): string {
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

export function unishortBytes(string: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(string);
}

export function addPadding(bytes: Uint8Array): Uint8Array {
    const missingLength = 16 - bytes.length % 16;
    const padding = new Uint8Array(missingLength);
    padding[0] = missingLength;
    return Uint8Array.from([...padding, ...bytes]);
}

export function removePadding(bytes: Uint8Array): Uint8Array {
    const missingLength = bytes[0];
    return bytes.slice(missingLength);
}

export function sha512(value: string, key?: string): string {
    const hashedValue = key === undefined ? crypt_sha512.base64(value) : crypt_sha512.base64Hmac(key, value);
    return hashedValue.replaceAll('/', '_');
}
