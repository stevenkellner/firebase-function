import { expect } from '@assertive-ts/core';
import { FirebaseFunctions, SubParameter, TestParameters, TestReturnType } from './firebaseFunctions';
import { FunctionsError } from '../../client';

describe('Request', () => {

    const firebaseFunctions = new FirebaseFunctions();

    before(() => {
        firebaseFunctions.setup();
    });

    it('should return the correct response', async () => {
        const result = await firebaseFunctions.firebaseFunctions.requests.request1.execute(new TestParameters('value1', [1, 2, 3], new SubParameter('a')));
        expect(result).toBeEqual(new TestReturnType('a value1', 6));
    });

    it('should return an error as the tag is incorrect', async () => {
        await expect(firebaseFunctions.firebaseFunctionsWithInvalidMacKey.requests.request1.execute(new TestParameters('value1', [1, 2, 3], new SubParameter('a'))))
            .toBeRejectedWith(new FunctionsError('failed-precondition', 'Invalid MAC tag'));
    });
});
