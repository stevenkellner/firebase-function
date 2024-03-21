import { ParameterContainer, ValueParameterBuilder, VoidLogger } from '../../src';
import { expect } from '../../testSrc';

describe('ParameterContainer', () => {
    const logger = new VoidLogger();

    it('get invalid parameter', () => {
        const parameterContainer = new ParameterContainer({
            // eslint-disable-next-line
            value1: undefined,
            value2: null,
            value3: 'asdf'
        }, logger.nextIndent);
        expect(() => parameterContainer.parameter('value0', new ValueParameterBuilder('number'))).to.throw();
        expect(() => parameterContainer.parameter('value1', new ValueParameterBuilder('number'))).to.throw();
        expect(() => parameterContainer.parameter('value2', new ValueParameterBuilder('number'))).to.throw();
        expect(() => parameterContainer.parameter('value3', new ValueParameterBuilder('number'))).to.throw();
    });

    it('get parameter', () => {
        const parameterContainer = new ParameterContainer({
            value0: undefined,
            value1: true,
            value2: 'asdf',
            value3: 12,
            value5: { value: 'asdf' },
            value6: null
        }, logger.nextIndent);
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        expect(parameterContainer.parameter('value0', new ValueParameterBuilder('undefined'))).to.be.equal(undefined);
        expect(parameterContainer.parameter('value1', new ValueParameterBuilder('boolean'))).to.be.equal(true);
        expect(parameterContainer.parameter('value2', new ValueParameterBuilder('string'))).to.be.equal('asdf');
        expect(parameterContainer.parameter('value3', new ValueParameterBuilder('number'))).to.be.equal(12);
        expect(parameterContainer.parameter('value5', new ValueParameterBuilder('object'))).to.be.deep.equal({ value: 'asdf' });
        expect(parameterContainer.parameter('value6', new ValueParameterBuilder('object'))).to.be.equal(null);
    });
});
