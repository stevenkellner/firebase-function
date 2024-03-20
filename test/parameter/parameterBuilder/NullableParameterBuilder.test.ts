import { NullableParameterBuilder, ValueParameterBuilder, VoidLogger } from '../../../src';
import { expect } from '../../../testSrc';

describe('NullableParameterBuilder', () => {
    const logger = new VoidLogger();

    it('undefined', () => {
        const builder = new NullableParameterBuilder(new ValueParameterBuilder('undefined'));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['object', 'undefined']));
        // eslint-disable-next-line no-undefined
        expect(builder.build(undefined, logger.nextIndent)).to.be.equal(undefined);
        expect(builder.build(null, logger.nextIndent)).to.be.equal(null);
        expect(() => builder.build({ value: 0 }, logger.nextIndent)).to.throw();
    });

    it('number', () => {
        const builder = new NullableParameterBuilder(new ValueParameterBuilder('number'));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['object', 'number']));
        expect(builder.build(1, logger.nextIndent)).to.be.equal(1);
        expect(builder.build(null, logger.nextIndent)).to.be.equal(null);
        expect(() => builder.build({ value: 0 }, logger.nextIndent)).to.throw();
    });

    it('object', () => {
        const builder = new NullableParameterBuilder(new ValueParameterBuilder('object'));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['object']));
        expect(builder.build(null, logger.nextIndent)).to.be.equal(null);
        expect(builder.build({ value: 0 }, logger.nextIndent)).to.be.deep.equal({ value: 0 });
    });

    it('multiple nullable', () => {
        const builder = new NullableParameterBuilder(new NullableParameterBuilder(new NullableParameterBuilder(new ValueParameterBuilder('number'))));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['object', 'number']));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['object', 'number']));
        expect(builder.build(1, logger.nextIndent)).to.be.equal(1);
        expect(builder.build(null, logger.nextIndent)).to.be.equal(null);
        expect(() => builder.build({ value: 0 }, logger.nextIndent)).to.throw();
    });
});
