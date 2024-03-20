import { type ILogger, Logger } from '../../src';
import { expect } from '../testUtils';

describe('Logger', () => {
    it('log not verbose', () => {
        const logger: ILogger = Logger.start('name 0');
        logger.log('name 1');
        logger.nextIndent.log('name 2', { k1: 1 }, 'notice');
        expect(logger.completeLog).to.be.equal('> [debug: name 0]\n> [debug: name 1]\n|   > [notice: name 2]\n');
    });

    it('log verbose', () => {
        const logger: ILogger = Logger.start('name 0', { k2: 'd' }, 'info', true);
        logger.log('name 1');
        logger.nextIndent.log('name 2', { k1: 1 }, 'notice');
        expect(logger.completeLog).to.be.equal('> [info: name 0]: {\n|     k2: \'d\'\n| }\n> [debug: name 1]: {}\n|   > [notice: name 2]: {\n|   |     k1: 1\n|   | }\n');
    });
});
