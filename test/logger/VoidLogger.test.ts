import { type ILogger, VoidLogger } from '../../src';
import { expect } from '../testUtils';

describe('VoidLogger', () => {
    it('log', () => {
        const logger: ILogger = new VoidLogger();
        logger.log('name 1');
        logger.nextIndent.log('name 2', { k1: 1 }, 'notice');
        expect(logger.completeLog).to.be.equal('');
    });
});
