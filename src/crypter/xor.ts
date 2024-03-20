export function xor(lhs: Uint8Array, rhs: Uint8Array): Uint8Array {
    if (lhs.length !== rhs.length)
        throw new Error('Xor operands must be the same length.');
    return lhs.map((lhsElement, index) => lhsElement ^ rhs[index]);
}
