import { ValueParameterBuilder, VoidLogger } from '../../../src';
import { expect } from '../../testUtils';

describe('ValueParameterBuilder', () => {
    const logger = new VoidLogger();

    it('undefined', () => {
        const builder = new ValueParameterBuilder('undefined');
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['undefined']));
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, no-undefined
        expect(builder.build(undefined, logger.nextIndent)).to.be.equal(undefined);
    });

    it('boolean', () => {
        const builder = new ValueParameterBuilder('boolean');
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['boolean']));
        expect(builder.build(true, logger.nextIndent)).to.be.equal(true);
        expect(builder.build(false, logger.nextIndent)).to.be.equal(false);
    });

    it('string', () => {
        const builder = new ValueParameterBuilder('string');
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['string']));
        expect(builder.build('', logger.nextIndent)).to.be.equal('');
        expect(builder.build('asdf', logger.nextIndent)).to.be.equal('asdf');
    });

    it('number', () => {
        const builder = new ValueParameterBuilder('number');
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['number']));
        expect(builder.build(0, logger.nextIndent)).to.be.equal(0);
        expect(builder.build(1.5, logger.nextIndent)).to.be.equal(1.5);
        expect(builder.build(-5, logger.nextIndent)).to.be.equal(-5);
    });

    it('bigint', () => {
        const builder = new ValueParameterBuilder('bigint');
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['bigint']));
        expect(builder.build(0n, logger.nextIndent)).to.be.equal(0n);
        expect(builder.build(357636n, logger.nextIndent)).to.be.equal(357636n);
        expect(builder.build(-5n, logger.nextIndent)).to.be.equal(-5n);
    });

    it('symbol', () => {
        const builder = new ValueParameterBuilder('symbol');
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['symbol']));
        expect(builder.build(Symbol.iterator, logger.nextIndent)).to.be.equal(Symbol.iterator);
    });

    it('object', () => {
        const builder = new ValueParameterBuilder('object');
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['object']));
        expect(builder.build(null, logger.nextIndent)).to.be.equal(null);
        expect(builder.build({}, logger.nextIndent)).to.be.deep.equal({});
        expect(builder.build({ v1: 'asdf' }, logger.nextIndent)).to.be.deep.equal({ v1: 'asdf' });
        expect(builder.build([], logger.nextIndent)).to.be.deep.equal([]);
        expect(builder.build([0, 1, 2], logger.nextIndent)).to.be.deep.equal([0, 1, 2]);
    });

    it('function', () => {
        const builder = new ValueParameterBuilder('function');
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['function']));
        function function1(): void {}
        expect(builder.build(function1, logger.nextIndent)).to.be.equal(function1);
        function function2(value: string): string {
            return `${value}asdf`;
        }
        expect(builder.build(function2, logger.nextIndent)).to.be.equal(function2);
    });
});
