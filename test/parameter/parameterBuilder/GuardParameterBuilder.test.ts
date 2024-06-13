import { GuardParameterBuilder, VoidLogger } from '../../../src';
import { expect } from '../../../src/testSrc';

describe('GuardParameterBuilder', () => {
    const logger = new VoidLogger();

    it('undefined', () => {
        const builder = new GuardParameterBuilder('undefined', (value): value is undefined => true);
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['undefined']));
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        expect(builder.build(undefined, logger.nextIndent)).to.be.equal(undefined);
    });

    it('boolean', () => {
        const builder = new GuardParameterBuilder('boolean', (value): value is true => value);
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['boolean']));
        expect(builder.build(true, logger.nextIndent)).to.be.equal(true);
        expect(() => builder.build(false, logger.nextIndent)).to.throw();
    });

    it('string', () => {
        const builder = new GuardParameterBuilder('string', (value): value is 'a' | 'b' => value === 'a' || value === 'b');
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['string']));
        expect(builder.build('a', logger.nextIndent)).to.be.equal('a');
        expect(builder.build('b', logger.nextIndent)).to.be.equal('b');
        expect(() => builder.build('c', logger.nextIndent)).to.throw();
        expect(() => builder.build('', logger.nextIndent)).to.throw();
    });

    it('number', () => {
        const builder = new GuardParameterBuilder('number', (value): value is 1 | 2 => value === 1 || value === 2);
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['number']));
        expect(builder.build(1, logger.nextIndent)).to.be.equal(1);
        expect(builder.build(2, logger.nextIndent)).to.be.equal(2);
        expect(() => builder.build(3, logger.nextIndent)).to.throw();
    });

    it('bigint', () => {
        const builder = new GuardParameterBuilder('bigint', (value): value is 1n | 2n => value === 1n || value === 2n);
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['bigint']));
        expect(builder.build(1n, logger.nextIndent)).to.be.equal(1n);
        expect(builder.build(2n, logger.nextIndent)).to.be.equal(2n);
        expect(() => builder.build(3n, logger.nextIndent)).to.throw();
    });

    it('object', () => {
        const builder = new GuardParameterBuilder('object', (value): value is { value: string } => value !== null && 'value' in value && typeof value.value === 'string');
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['object']));
        expect(builder.build({ value: 'asdf' }, logger.nextIndent)).to.be.deep.equal({ value: 'asdf' });
        expect(() => builder.build(null, logger.nextIndent)).to.throw();
        expect(() => builder.build({}, logger.nextIndent)).to.throw();
        expect(() => builder.build({ value: 0 }, logger.nextIndent)).to.throw();
    });
});
