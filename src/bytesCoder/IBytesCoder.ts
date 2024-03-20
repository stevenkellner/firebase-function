export interface IBytesCoder<T> {

    encode(data: T): Uint8Array;

    decode(data: Uint8Array): T;
}
