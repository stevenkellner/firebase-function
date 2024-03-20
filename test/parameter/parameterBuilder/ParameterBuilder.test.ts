import { ParameterBuilder, VoidLogger } from '../../../src';
import { expect } from '../../testUtils';

describe('ParameterBuilder', () => {
    const logger = new VoidLogger();

    it('undefined', () => {
        const builder = new ParameterBuilder('undefined', () => 'asdf');
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['undefined']));
        // eslint-disable-next-line no-undefined
        expect(builder.build(undefined, logger.nextIndent)).to.be.equal('asdf');
    });

    it('boolean', () => {
        const builder = new ParameterBuilder('boolean', value => value ? 'a' : 'b');
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['boolean']));
        expect(builder.build(true, logger.nextIndent)).to.be.equal('a');
        expect(builder.build(false, logger.nextIndent)).to.be.equal('b');
    });

    it('string', () => {
        const builder = new ParameterBuilder('string', value => `${value}asdf`);
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['string']));
        expect(builder.build('', logger.nextIndent)).to.be.equal('asdf');
        expect(builder.build('ölkj', logger.nextIndent)).to.be.equal('ölkjasdf');
    });

    it('number', () => {
        const builder = new ParameterBuilder('number', value => value.toString());
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['number']));
        expect(builder.build(0, logger.nextIndent)).to.be.equal('0');
        expect(builder.build(-1.5, logger.nextIndent)).to.be.equal('-1.5');
    });

    it('bigint', () => {
        const builder = new ParameterBuilder('bigint', value => value.toString());
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['bigint']));
        expect(builder.build(0n, logger.nextIndent)).to.be.equal('0');
        expect(builder.build(-15n, logger.nextIndent)).to.be.equal('-15');
    });

    it('object', () => {
        const builder = new ParameterBuilder('object', value => value === null ? null : 'asdf');
        expect(builder.expectedTypes).to.be.deep.equal(new Set(['object']));
        expect(builder.build(null, logger.nextIndent)).to.be.equal(null);
        expect(builder.build({}, logger.nextIndent)).to.be.equal('asdf');
    });
});
