import { expect } from '@assertive-ts/core';
import { createFirebaseFunctions } from './firebaseFunctions';
import { FunctionsError } from '../../src';
import { MySubParameter } from '../../example/functions/src/types/MyParameters';
import { MyReturnType } from '../../example/functions/src/types/MyReturnType';

describe('Functions', () => {

    let firebaseFunctions: ReturnType<typeof createFirebaseFunctions>;

    before(() => {
        const macKey = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
        firebaseFunctions = createFirebaseFunctions(macKey);
    });

    it('should return the correct response', async () => {
        const result = await firebaseFunctions.function1.execute({
            v1: 'value1',
            v2: [1, 2, 3],
            v3: new MySubParameter('a')
        });
        expect(result).toBeEqual(new MyReturnType('a value1', 6));
    });

    it('should return an error as the tag is incorrect', async () => {
        const firebaseFunctions = createFirebaseFunctions(new Uint8Array());
        await expect(firebaseFunctions.function1.execute({
            v1: 'value1',
            v2: [1, 2, 3],
            v3: new MySubParameter('a')
        })).toBeRejectedWith(new FunctionsError('failed-precondition', 'Invalid MAC tag'));
    });
});
