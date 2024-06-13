import { OptionalParameterBuilder, ValueParameterBuilder, VoidLogger } from '../../../src';
import { expect } from '../../../src/testSrc';

describe('OptionalParameterBuilder', () => {
    const logger = new VoidLogger();

    it('undefined', () => {
        const builder = new OptionalParameterBuilder(new ValueParameterBuilder('undefined'));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['undefined']));
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        expect(builder.build(undefined, logger.nextIndent)).to.be.equal(undefined);
    });

    it('number', () => {
        const builder = new OptionalParameterBuilder(new ValueParameterBuilder('number'));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['undefined', 'number']));
        expect(builder.build(undefined, logger.nextIndent)).to.be.equal(undefined);
        expect(builder.build(0, logger.nextIndent)).to.be.equal(0);
    });

    it('multiple optional', () => {
        const builder = new OptionalParameterBuilder(new OptionalParameterBuilder(new OptionalParameterBuilder(new ValueParameterBuilder('number'))));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['undefined', 'number']));
        expect(builder.build(undefined, logger.nextIndent)).to.be.equal(undefined);
        expect(builder.build(0, logger.nextIndent)).to.be.equal(0);
    });
});
