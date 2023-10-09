import { ArrayParameterBuilder, GuardParameterBuilder, type IParameterBuilder, NullableParameterBuilder, OptionalParameterBuilder, ParameterBuilder, ValueParameterBuilder } from '../src/parameter';
import { Logger, VerboseType } from '../src/logger';
import { expect } from 'chai';

describe('Parameter builder', () => {
    const logger = Logger.start(new VerboseType('coloredVerbose'), 'Parameter builder tests');

    it('multiple types', () => {
        const builder: IParameterBuilder<'string' | 'number', string | number> = { expectedTypes: ['string', 'number'], build: value => value.toString() };
        expect(builder.expectedTypes).to.be.deep.equal(['string', 'number']);
        expect(builder.build('asdf', logger.nextIndent)).to.be.equal('asdf');
        expect(builder.build(1, logger.nextIndent)).to.be.equal('1');
    });

    describe('value', () => {
        it('undefined', () => {
            const builder = new ValueParameterBuilder('undefined');
            expect(builder.expectedTypes).be.be.deep.equal(['undefined']);
            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, no-undefined
            expect(builder.build(undefined, logger.nextIndent)).to.be.undefined;
        });

        it('boolean', () => {
            const builder = new ValueParameterBuilder('boolean');
            expect(builder.expectedTypes).be.be.deep.equal(['boolean']);
            expect(builder.build(true, logger.nextIndent)).to.be.true;
            expect(builder.build(false, logger.nextIndent)).to.be.false;
        });

        it('string', () => {
            const builder = new ValueParameterBuilder('string');
            expect(builder.expectedTypes).be.be.deep.equal(['string']);
            expect(builder.build('', logger.nextIndent)).to.be.equal('');
            expect(builder.build('asdf', logger.nextIndent)).to.be.equal('asdf');
        });

        it('number', () => {
            const builder = new ValueParameterBuilder('number');
            expect(builder.expectedTypes).be.be.deep.equal(['number']);
            expect(builder.build(0, logger.nextIndent)).to.be.equal(0);
            expect(builder.build(1.5, logger.nextIndent)).to.be.equal(1.5);
            expect(builder.build(-5, logger.nextIndent)).to.be.equal(-5);
        });

        it('bigint', () => {
            const builder = new ValueParameterBuilder('bigint');
            expect(builder.expectedTypes).be.be.deep.equal(['bigint']);
            expect(builder.build(0n, logger.nextIndent)).to.be.equal(0n);
            expect(builder.build(-5n, logger.nextIndent)).to.be.equal(-5n);
        });

        it('symbol', () => {
            const builder = new ValueParameterBuilder('symbol');
            expect(builder.expectedTypes).be.be.deep.equal(['symbol']);
            expect(builder.build(Symbol.iterator, logger.nextIndent)).to.be.equal(Symbol.iterator);
        });

        it('object', () => {
            const builder = new ValueParameterBuilder('object');
            expect(builder.expectedTypes).be.be.deep.equal(['object']);
            expect(builder.build(null, logger.nextIndent)).to.be.null;
            expect(builder.build({ v1: 'asdf' }, logger.nextIndent)).to.be.deep.equal({ v1: 'asdf' });
            expect(builder.build([0, 1, 2], logger.nextIndent)).to.be.deep.equal([0, 1, 2]);
        });

        it('function', () => {
            const builder = new ValueParameterBuilder('function');
            expect(builder.expectedTypes).be.be.deep.equal(['function']);
            function function1(): void {}
            expect(builder.build(function1, logger.nextIndent)).to.be.equal(function1);
            function function2(value: string): string {
                return `${value}asdf`;
            }
            expect(builder.build(function2, logger.nextIndent)).to.be.equal(function2);
        });
    });

    describe('guard', () => {
        it('undefined', () => {
            // eslint-disable-next-line no-undefined
            const builder = new GuardParameterBuilder('undefined', (value): value is undefined => true);
            expect(builder.expectedTypes).be.be.deep.equal(['undefined']);
            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, no-undefined
            expect(builder.build(undefined, logger.nextIndent)).to.be.undefined;
        });

        it('boolean', () => {
            const builder = new GuardParameterBuilder('boolean', (value): value is true => value);
            expect(builder.expectedTypes).be.be.deep.equal(['boolean']);
            expect(builder.build(true, logger.nextIndent)).to.be.equal(true);
            expect(() => builder.build(false, logger.nextIndent)).to.throw();
        });

        it('string', () => {
            const builder = new GuardParameterBuilder('string', (value): value is 'a' | 'b' => value === 'a' || value === 'b');
            expect(builder.expectedTypes).be.be.deep.equal(['string']);
            expect(builder.build('a', logger.nextIndent)).to.be.equal('a');
            expect(builder.build('b', logger.nextIndent)).to.be.equal('b');
            expect(() => builder.build('c', logger.nextIndent)).to.throw();
            expect(() => builder.build('', logger.nextIndent)).to.throw();
        });

        it('number', () => {
            const builder = new GuardParameterBuilder('number', (value): value is 1 | 2 => value === 1 || value === 2);
            expect(builder.expectedTypes).be.be.deep.equal(['number']);
            expect(builder.build(1, logger.nextIndent)).to.be.equal(1);
            expect(builder.build(2, logger.nextIndent)).to.be.equal(2);
            expect(() => builder.build(3, logger.nextIndent)).to.throw();
        });

        it('bigint', () => {
            const builder = new GuardParameterBuilder('bigint', (value): value is 1n | 2n => value === 1n || value === 2n);
            expect(builder.expectedTypes).be.be.deep.equal(['bigint']);
            expect(builder.build(1n, logger.nextIndent)).to.be.equal(1n);
            expect(builder.build(2n, logger.nextIndent)).to.be.equal(2n);
            expect(() => builder.build(3n, logger.nextIndent)).to.throw();
        });

        it('object', () => {
            const builder = new GuardParameterBuilder('object', (value): value is { value: string } => value !== null && 'value' in value && typeof value.value === 'string');
            expect(builder.expectedTypes).be.be.deep.equal(['object']);
            expect(builder.build({ value: 'asdf' }, logger.nextIndent)).to.be.deep.equal({ value: 'asdf' });
            expect(() => builder.build(null, logger.nextIndent)).to.throw();
            expect(() => builder.build({}, logger.nextIndent)).to.throw();
            expect(() => builder.build({ value: 0 }, logger.nextIndent)).to.throw();
        });
    });

    describe('build', () => {
        it('undefined', () => {
            const builder = new ParameterBuilder('undefined', () => 'asdf');
            expect(builder.expectedTypes).to.be.deep.equal(['undefined']);
            // eslint-disable-next-line no-undefined
            expect(builder.build(undefined, logger.nextIndent)).to.be.equal('asdf');
        });

        it('boolean', () => {
            const builder = new ParameterBuilder('boolean', value => value ? 'a' : 'b');
            expect(builder.expectedTypes).to.be.deep.equal(['boolean']);
            expect(builder.build(true, logger.nextIndent)).to.be.equal('a');
            expect(builder.build(false, logger.nextIndent)).to.be.equal('b');
        });

        it('string', () => {
            const builder = new ParameterBuilder('string', value => `${value}asdf`);
            expect(builder.expectedTypes).to.be.deep.equal(['string']);
            expect(builder.build('', logger.nextIndent)).to.be.equal('asdf');
            expect(builder.build('ölkj', logger.nextIndent)).to.be.equal('ölkjasdf');
        });

        it('number', () => {
            const builder = new ParameterBuilder('number', value => value.toString());
            expect(builder.expectedTypes).to.be.deep.equal(['number']);
            expect(builder.build(0, logger.nextIndent)).to.be.equal('0');
            expect(builder.build(-1.5, logger.nextIndent)).to.be.equal('-1.5');
        });

        it('bigint', () => {
            const builder = new ParameterBuilder('bigint', value => value.toString());
            expect(builder.expectedTypes).to.be.deep.equal(['bigint']);
            expect(builder.build(0n, logger.nextIndent)).to.be.equal('0');
            expect(builder.build(-15n, logger.nextIndent)).to.be.equal('-15');
        });

        it('object', () => {
            const builder = new ParameterBuilder('object', value => value === null ? null : 'asdf');
            expect(builder.expectedTypes).to.be.deep.equal(['object']);
            expect(builder.build(null, logger.nextIndent)).to.be.null;
            expect(builder.build({}, logger.nextIndent)).to.be.equal('asdf');
        });
    });

    describe('optional', () => {
        it('undefined', () => {
            const builder = new OptionalParameterBuilder(new ValueParameterBuilder('undefined'));
            expect(builder.expectedTypes).to.be.deep.equal(['undefined']);
            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, no-undefined
            expect(builder.build(undefined, logger.nextIndent)).to.be.undefined;
        });

        it('number', () => {
            const builder = new OptionalParameterBuilder(new ValueParameterBuilder('number'));
            expect(builder.expectedTypes).to.be.deep.equal(['undefined', 'number']);
            // eslint-disable-next-line no-undefined
            expect(builder.build(undefined, logger.nextIndent)).to.be.undefined;
            expect(builder.build(0, logger.nextIndent)).to.be.equal(0);
        });

        it('multiple optional', () => {
            const builder = new OptionalParameterBuilder(new OptionalParameterBuilder(new OptionalParameterBuilder(new ValueParameterBuilder('number'))));
            expect(builder.expectedTypes).to.be.deep.equal(['undefined', 'number']);
            // eslint-disable-next-line no-undefined
            expect(builder.build(undefined, logger.nextIndent)).to.be.undefined;
            expect(builder.build(0, logger.nextIndent)).to.be.equal(0);
        });
    });

    describe('nullable', () => {
        it('undefined', () => {
            const builder = new NullableParameterBuilder(new ValueParameterBuilder('undefined'));
            expect(builder.expectedTypes).to.be.deep.equal(['object', 'undefined']);
            // eslint-disable-next-line no-undefined
            expect(builder.build(undefined, logger.nextIndent)).to.be.undefined;
            expect(builder.build(null, logger.nextIndent)).to.be.null;
            expect(() => builder.build({ value: 0 }, logger.nextIndent)).to.throw();
        });

        it('number', () => {
            const builder = new NullableParameterBuilder(new ValueParameterBuilder('number'));
            expect(builder.expectedTypes).to.be.deep.equal(['object', 'number']);
            expect(builder.build(1, logger.nextIndent)).to.be.equal(1);
            expect(builder.build(null, logger.nextIndent)).to.be.null;
            expect(() => builder.build({ value: 0 }, logger.nextIndent)).to.throw();
        });

        it('object', () => {
            const builder = new NullableParameterBuilder(new ValueParameterBuilder('object'));
            expect(builder.expectedTypes).to.be.deep.equal(['object']);
            expect(builder.build(null, logger.nextIndent)).to.be.null;
            expect(builder.build({ value: 0 }, logger.nextIndent)).to.be.deep.equal({ value: 0 });
        });

        it('multiple nullable', () => {
            const builder = new NullableParameterBuilder(new NullableParameterBuilder(new NullableParameterBuilder(new ValueParameterBuilder('number'))));
            expect(builder.expectedTypes).to.be.deep.equal(['object', 'number']);
            expect(builder.expectedTypes).to.be.deep.equal(['object', 'number']);
            expect(builder.build(1, logger.nextIndent)).to.be.equal(1);
            expect(builder.build(null, logger.nextIndent)).to.be.null;
            expect(() => builder.build({ value: 0 }, logger.nextIndent)).to.throw();
        });
    });

    describe('array', () => {
        it('undefined', () => {
            const builder1 = new ArrayParameterBuilder(new ValueParameterBuilder('undefined'));
            expect(builder1.expectedTypes).to.be.deep.equal(['object']);
            const builder2 = new ArrayParameterBuilder(new ValueParameterBuilder('undefined'), 2);
            expect(builder2.expectedTypes).to.be.deep.equal(['object']);
            expect(() => builder1.build(null, logger.nextIndent)).to.throw();
            expect(() => builder1.build({ value: 'asdf' }, logger.nextIndent)).to.throw();
            expect(() => builder2.build([], logger.nextIndent)).to.throw();
            // eslint-disable-next-line no-undefined
            expect(() => builder2.build([undefined], logger.nextIndent)).to.throw();
            expect(() => builder1.build([0, 1, 2], logger.nextIndent)).to.throw();
            expect(builder1.build([], logger.nextIndent)).to.be.deep.equal([]);
            // eslint-disable-next-line no-undefined
            expect(builder1.build([undefined], logger.nextIndent)).to.be.deep.equal([undefined]);
            // eslint-disable-next-line no-undefined
            expect(builder2.build([undefined, undefined], logger.nextIndent)).to.be.deep.equal([undefined, undefined]);
        });

        it('number', () => {
            const builder = new ArrayParameterBuilder(new ValueParameterBuilder('number'));
            expect(builder.expectedTypes).to.be.deep.equal(['object']);
            expect(builder.build([], logger.nextIndent)).to.be.deep.equal([]);
            expect(builder.build([0, 1, 2], logger.nextIndent)).to.be.deep.equal([0, 1, 2]);
        });

        it('build', () => {
            const builder = new ArrayParameterBuilder(new ParameterBuilder('number', value => value.toString()));
            expect(builder.expectedTypes).to.be.deep.equal(['object']);
            expect(builder.build([], logger.nextIndent)).to.be.deep.equal([]);
            expect(builder.build([0, 1, 2], logger.nextIndent)).to.be.deep.equal(['0', '1', '2']);
        });

        it('optional', () => {
            const builder = new ArrayParameterBuilder(new OptionalParameterBuilder(new ValueParameterBuilder('string')));
            expect(builder.expectedTypes).to.be.deep.equal(['object']);
            expect(builder.build([], logger.nextIndent)).to.be.deep.equal([]);
            // eslint-disable-next-line no-undefined
            expect(builder.build(['0', undefined, '1', undefined, undefined, '2'], logger.nextIndent)).to.be.deep.equal(['0', undefined, '1', undefined, undefined, '2']);
        });
    });
});
