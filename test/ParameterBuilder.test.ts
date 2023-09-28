import { expect } from 'chai';
import { Logger, type ILogger, VerboseType } from '../src/logger';
import { type IParameterBuilder, ParameterBuilder, ValueParameterBuilder, GuardParameterBuilder, OptionalParameterBuilder, NullableParameterBuilder, ArrayParameterBuilder } from '../src/parameter';

describe('Parameter builder', () => {
    const logger = Logger.start(new VerboseType('coloredVerbose'), 'Parameter builder tests');

    it('multiple types', () => {
        const builder: IParameterBuilder<'string' | 'number', string | number> = { expectedTypes: ['string', 'number'], build: (value: string | number, logger: ILogger) => value.toString() };
        expect(builder.expectedTypes).to.be.deep.equal(['string', 'number']);
        expect(builder.build('asdf', logger.nextIndent)).to.be.equal('asdf');
        expect(builder.build(1, logger.nextIndent)).to.be.equal('1');
    });

    describe('value', () => {
        it('undefined', () => {
            const builder = new ValueParameterBuilder('undefined');
            expect(builder.expectedTypes).be.be.deep.equal(['undefined']);
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
            const function1 = () => {};
            expect(builder.build(function1, logger.nextIndent)).to.be.equal(function1);
            const function2 = (value: string) => value + 'asdf';
            expect(builder.build(function2, logger.nextIndent)).to.be.equal(function2);
        });
    });

    describe('guard', () => {
        it('undefined', () => {
            const builder = new GuardParameterBuilder('undefined', ((value: undefined, logger: ILogger) => value === undefined) as (value: undefined, logger: ILogger) => value is undefined);
            expect(builder.expectedTypes).be.be.deep.equal(['undefined']);
            expect(builder.build(undefined, logger.nextIndent)).to.be.undefined;
        });

        it('boolean', () => {
            const builder = new GuardParameterBuilder('boolean', ((value: boolean, logger: ILogger) => value) as (value: boolean, logger: ILogger) => value is true);
            expect(builder.expectedTypes).be.be.deep.equal(['boolean']);
            expect(builder.build(true, logger.nextIndent)).to.be.equal(true);
            expect(() => builder.build(false, logger.nextIndent)).to.throw();
        });

        it('string', () => {
            const builder = new GuardParameterBuilder('string', ((value: string, logger: ILogger) => value === 'a' || value === 'b') as (value: string, logger: ILogger) => value is 'a' | 'b');
            expect(builder.expectedTypes).be.be.deep.equal(['string']);
            expect(builder.build('a', logger.nextIndent)).to.be.equal('a');
            expect(builder.build('b', logger.nextIndent)).to.be.equal('b');
            expect(() => builder.build('c', logger.nextIndent)).to.throw();
            expect(() => builder.build('', logger.nextIndent)).to.throw();
        });

        it('number', () => {
            const builder = new GuardParameterBuilder('number', ((value: number, logger: ILogger) => value === 1 || value === 2) as (value: number, logger: ILogger) => value is 1 | 2);
            expect(builder.expectedTypes).be.be.deep.equal(['number']);
            expect(builder.build(1, logger.nextIndent)).to.be.equal(1);
            expect(builder.build(2, logger.nextIndent)).to.be.equal(2);
            expect(() => builder.build(3, logger.nextIndent)).to.throw();
        });

        it('bigint', () => {
            const builder = new GuardParameterBuilder('bigint', ((value: bigint, logger: ILogger) => value === 1n || value === 2n) as (value: bigint, logger: ILogger) => value is 1n | 2n);
            expect(builder.expectedTypes).be.be.deep.equal(['bigint']);
            expect(builder.build(1n, logger.nextIndent)).to.be.equal(1n);
            expect(builder.build(2n, logger.nextIndent)).to.be.equal(2n);
            expect(() => builder.build(3n, logger.nextIndent)).to.throw();
        });

        it('object', () => {
            const builder = new GuardParameterBuilder('object', ((value: object | null, logger: ILogger) => value !== null && 'v' in value && typeof value.v === 'string') as (value: object | null, logger: ILogger) => value is { v: string });
            expect(builder.expectedTypes).be.be.deep.equal(['object']);
            expect(builder.build({ v: 'asdf' }, logger.nextIndent)).to.be.deep.equal({ v: 'asdf' });
            expect(() => builder.build(null, logger.nextIndent)).to.throw();
            expect(() => builder.build({}, logger.nextIndent)).to.throw();
            expect(() => builder.build({ v: 0 }, logger.nextIndent)).to.throw();
        });
    });

    describe('build', () => {
        it('undefined', () => {
            const builder = new ParameterBuilder('undefined', (value: undefined, logger: ILogger) => 'asdf');
            expect(builder.expectedTypes).to.be.deep.equal(['undefined']);
            expect(builder.build(undefined, logger.nextIndent)).to.be.equal('asdf');
        });

        it('boolean', () => {
            const builder = new ParameterBuilder('boolean', (value: boolean, logger: ILogger) => value ? 'a' : 'b');
            expect(builder.expectedTypes).to.be.deep.equal(['boolean']);
            expect(builder.build(true, logger.nextIndent)).to.be.equal('a');
            expect(builder.build(false, logger.nextIndent)).to.be.equal('b');
        });

        it('string', () => {
            const builder = new ParameterBuilder('string', (value: string, logger: ILogger) => value + 'asdf');
            expect(builder.expectedTypes).to.be.deep.equal(['string']);
            expect(builder.build('', logger.nextIndent)).to.be.equal('asdf');
            expect(builder.build('ölkj', logger.nextIndent)).to.be.equal('ölkjasdf');
        });

        it('number', () => {
            const builder = new ParameterBuilder('number', (value: number, logger: ILogger) => value.toString());
            expect(builder.expectedTypes).to.be.deep.equal(['number']);
            expect(builder.build(0, logger.nextIndent)).to.be.equal('0');
            expect(builder.build(-1.5, logger.nextIndent)).to.be.equal('-1.5');
        });

        it('bigint', () => {
            const builder = new ParameterBuilder('bigint', (value: bigint, logger: ILogger) => value.toString());
            expect(builder.expectedTypes).to.be.deep.equal(['bigint']);
            expect(builder.build(0n, logger.nextIndent)).to.be.equal('0');
            expect(builder.build(-15n, logger.nextIndent)).to.be.equal('-15');
        });

        it('object', () => {
            const builder = new ParameterBuilder('object', (value: object | null, logger: ILogger) => value === null ? null : 'asdf');
            expect(builder.expectedTypes).to.be.deep.equal(['object']);
            expect(builder.build(null, logger.nextIndent)).to.be.null;
            expect(builder.build({}, logger.nextIndent)).to.be.equal('asdf');
        });
    });

    describe('optional', () => {
        it('undefined', () => {
            const builder = new OptionalParameterBuilder(new ValueParameterBuilder('undefined'));
            expect(builder.expectedTypes).to.be.deep.equal(['undefined']);
            expect(builder.build(undefined, logger.nextIndent)).to.be.undefined;
        });

        it('number', () => {
            const builder = new OptionalParameterBuilder(new ValueParameterBuilder('number'));
            expect(builder.expectedTypes).to.be.deep.equal(['undefined', 'number']);
            expect(builder.build(undefined, logger.nextIndent)).to.be.undefined;
            expect(builder.build(0, logger.nextIndent)).to.be.equal(0);
        });

        it('multiple optional', () => {
            const builder = new OptionalParameterBuilder(new OptionalParameterBuilder(new OptionalParameterBuilder(new ValueParameterBuilder('number'))));
            expect(builder.expectedTypes).to.be.deep.equal(['undefined', 'number']);
            expect(builder.build(undefined, logger.nextIndent)).to.be.undefined;
            expect(builder.build(0, logger.nextIndent)).to.be.equal(0);
        });
    });

    describe('nullable', () => {
        it('undefined', () => {
            const builder = new NullableParameterBuilder(new ValueParameterBuilder('undefined'));
            expect(builder.expectedTypes).to.be.deep.equal(['object', 'undefined']);
            expect(builder.build(undefined, logger.nextIndent)).to.be.undefined;
            expect(builder.build(null, logger.nextIndent)).to.be.null;
            expect(() => builder.build({ v: 0 }, logger.nextIndent)).to.throw();
        });

        it('number', () => {
            const builder = new NullableParameterBuilder(new ValueParameterBuilder('number'));
            expect(builder.expectedTypes).to.be.deep.equal(['object', 'number']);
            expect(builder.build(1, logger.nextIndent)).to.be.equal(1);
            expect(builder.build(null, logger.nextIndent)).to.be.null;
            expect(() => builder.build({ v: 0 }, logger.nextIndent)).to.throw();
        });

        it('object', () => {
            const builder = new NullableParameterBuilder(new ValueParameterBuilder('object'));
            expect(builder.expectedTypes).to.be.deep.equal(['object']);
            expect(builder.build(null, logger.nextIndent)).to.be.null;
            expect(builder.build({ v: 0 }, logger.nextIndent)).to.be.deep.equal({ v: 0 });
        });

        it('multiple nullable', () => {
            const builder = new NullableParameterBuilder(new NullableParameterBuilder(new NullableParameterBuilder(new ValueParameterBuilder('number'))));
            expect(builder.expectedTypes).to.be.deep.equal(['object', 'number']);
            expect(builder.expectedTypes).to.be.deep.equal(['object', 'number']);
            expect(builder.build(1, logger.nextIndent)).to.be.equal(1);
            expect(builder.build(null, logger.nextIndent)).to.be.null;
            expect(() => builder.build({ v: 0 }, logger.nextIndent)).to.throw();
        });
    });

    describe('array', () => {
        it('undefined', () => {
            const builder1 = new ArrayParameterBuilder(new ValueParameterBuilder('undefined'));
            expect(builder1.expectedTypes).to.be.deep.equal(['object']);
            const builder2 = new ArrayParameterBuilder(new ValueParameterBuilder('undefined'), 2);
            expect(builder2.expectedTypes).to.be.deep.equal(['object']);
            expect(() => builder1.build(null, logger.nextIndent)).to.throw();
            expect(() => builder1.build({ v: 'asdf' }, logger.nextIndent)).to.throw();
            expect(() => builder2.build([], logger.nextIndent)).to.throw();
            expect(() => builder2.build([undefined], logger.nextIndent)).to.throw();
            expect(() => builder1.build([0, 1, 2], logger.nextIndent)).to.throw();
            expect(builder1.build([], logger.nextIndent)).to.be.deep.equal([]);
            expect(builder1.build([undefined], logger.nextIndent)).to.be.deep.equal([undefined]);
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
            expect(builder.build(['0', undefined, '1', undefined, undefined, '2'], logger.nextIndent)).to.be.deep.equal(['0', undefined, '1', undefined, undefined, '2']);
        });
    });
});
