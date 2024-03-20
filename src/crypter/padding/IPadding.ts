export interface IPadding {

    addPadding(data: Uint8Array, blockSize: number): Uint8Array;

    removePadding(data: Uint8Array): Uint8Array;
}
