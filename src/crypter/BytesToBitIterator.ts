import { bits } from './utils';

export class BytesToBitIterator implements Iterator<0 | 1, null> {
    private readonly bytesIterator: Iterator<number, null>;

    private currentBitsIterator: Iterator<0 | 1, null> | null = null;

    public constructor(bytes: Uint8Array) {
        this.bytesIterator = bytes[Symbol.iterator]();
        const bytesIteratorResult = this.bytesIterator.next();
        if (!(bytesIteratorResult.done ?? false))
            this.currentBitsIterator = bits(bytesIteratorResult.value)[Symbol.iterator]();
    }

    public next(): IteratorResult<0 | 1, null> {
        if (!this.currentBitsIterator)
            return { done: true, value: null };
        const currentBitsIteratorResult = this.currentBitsIterator.next();
        if (!(currentBitsIteratorResult.done ?? false))
            return { value: currentBitsIteratorResult.value };
        const bytesIteratorResult = this.bytesIterator.next();
        if (bytesIteratorResult.done ?? false)
            this.currentBitsIterator = null;
        else
            this.currentBitsIterator = bits(bytesIteratorResult.value)[Symbol.iterator]();
        return this.next();
    }
}
