import { ArrayParameterBuilder, OptionalParameterBuilder, ParameterBuilder, ValueParameterBuilder, VoidLogger } from '../../../src';
import { expect } from '../../../testSrc';

describe('ArrayParameterBuilder', () => {
    const logger = new VoidLogger();

    it('with length', () => {
        const builder = new ArrayParameterBuilder(new ValueParameterBuilder('number'), 2);
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['object']));
        expect(() => builder.build([], logger.nextIndent)).to.throw();
        expect(() => builder.build([0], logger.nextIndent)).to.throw();
        expect(builder.build([0, 1], logger.nextIndent)).to.be.deep.equal([0, 1]);
        expect(() => builder.build([0, 1, 2], logger.nextIndent)).to.throw();
    });

    it('undefined', () => {
        const builder = new ArrayParameterBuilder(new ValueParameterBuilder('undefined'));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['object']));
        expect(() => builder.build(null, logger.nextIndent)).to.throw();
        expect(() => builder.build({ value: 'asdf' }, logger.nextIndent)).to.throw();
        expect(() => builder.build([0, 1, 2], logger.nextIndent)).to.throw();
        expect(builder.build([], logger.nextIndent)).to.be.deep.equal([]);
        // eslint-disable-next-line no-undefined
        expect(builder.build([undefined], logger.nextIndent)).to.be.deep.equal([undefined]);
    });

    it('number', () => {
        const builder = new ArrayParameterBuilder(new ValueParameterBuilder('number'));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['object']));
        expect(builder.build([], logger.nextIndent)).to.be.deep.equal([]);
        expect(builder.build([0, 1, 2], logger.nextIndent)).to.be.deep.equal([0, 1, 2]);
    });

    it('build', () => {
        const builder = new ArrayParameterBuilder(new ParameterBuilder('number', value => value.toString()));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['object']));
        expect(builder.build([], logger.nextIndent)).to.be.deep.equal([]);
        expect(builder.build([0, 1, 2], logger.nextIndent)).to.be.deep.equal(['0', '1', '2']);
    });

    it('optional', () => {
        const builder = new ArrayParameterBuilder(new OptionalParameterBuilder(new ValueParameterBuilder('string')));
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['object']));
        expect(builder.build([], logger.nextIndent)).to.be.deep.equal([]);
        // eslint-disable-next-line no-undefined
        expect(builder.build(['0', undefined, '1', undefined, undefined, '2'], logger.nextIndent)).to.be.deep.equal(['0', undefined, '1', undefined, undefined, '2']);
    });
});
