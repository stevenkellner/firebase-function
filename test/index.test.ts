/* eslint-disable no-console */
import { Block } from 'aes-ts';

it('index', () => {
    const aes = new Block([9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 8, 7, 6, 5, 4, 3]);
    const encrypted = aes.encrypt(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    console.log(encrypted);
    console.log(aes.encrypt(new Uint8Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])));
});
