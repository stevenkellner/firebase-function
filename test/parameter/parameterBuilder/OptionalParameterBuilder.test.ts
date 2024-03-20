import { OptionalParameterBuilder, ValueParameterBuilder, VoidLogger } from '../../../src';
import { expect } from '../../testUtils';

describe('OptionalParameterBuilder', () => {
    const logger = new VoidLogger();

    it('undefined', () => {
        const builder = new OptionalParameterBuilder(new ValueParameterBuilder('undefined'));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['undefined']));
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, no-undefined
        expect(builder.build(undefined, logger.nextIndent)).to.be.equal(undefined);
    });

    it('number', () => {
        const builder = new OptionalParameterBuilder(new ValueParameterBuilder('number'));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['undefined', 'number']));
        // eslint-disable-next-line no-undefined
        expect(builder.build(undefined, logger.nextIndent)).to.be.equal(undefined);
        expect(builder.build(0, logger.nextIndent)).to.be.equal(0);
    });

    it('multiple optional', () => {
        const builder = new OptionalParameterBuilder(new OptionalParameterBuilder(new OptionalParameterBuilder(new ValueParameterBuilder('number'))));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['undefined', 'number']));
        // eslint-disable-next-line no-undefined
        expect(builder.build(undefined, logger.nextIndent)).to.be.equal(undefined);
        expect(builder.build(0, logger.nextIndent)).to.be.equal(0);
    });
});
