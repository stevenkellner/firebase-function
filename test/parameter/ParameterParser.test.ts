import { GuardParameterBuilder, HttpsError, type ILogger, type IParameterBuilders, OptionalParameterBuilder, ParameterBuilder, ParameterContainer, ParameterParser, ValueParameterBuilder, VoidLogger, DatabaseType } from '../../src';
import { expect } from '../../testSrc';

class StringClassType {
    public constructor(public value: 'v1' | 'v2' | 'v3') {}
}

namespace StringClassType {
    export function fromString(value: string, logger: ILogger): StringClassType {
        if (value !== 'v1' && value !== 'v2' && value !== 'v3')
            throw HttpsError('internal', '', logger);
        return new StringClassType(value);
    }
}

class NumberClassType {
    public constructor(public value: number) {}
}

namespace NumberClassType {
    export function fromNumber(value: number): NumberClassType {
        return new NumberClassType(value);
    }
}
class ObjectClassType {
    public constructor(public v1: string, public v2: number) {}
}

namespace ObjectClassType {
    export function fromObject(value: object | null, logger: ILogger): ObjectClassType {
        if (value === null)
            throw HttpsError('internal', '', logger);
        if (!('v1' in value) || typeof value.v1 !== 'string')
            throw HttpsError('internal', '', logger);
        if (!('v2' in value) || typeof value.v2 !== 'number')
            throw HttpsError('internal', '', logger);
        return new ObjectClassType(value.v1, value.v2);
    }
}

describe('ParameterParser', () => {
    const logger = new VoidLogger();

    it('get parameter before parsing', () => {
        expect(() => {
            const parameterParser = new ParameterParser<{
                value: string;
            }>({
                value: new ValueParameterBuilder('string')
            }, logger.nextIndent);
            parameterParser.parameters;
        }).to.throw('internal');
    });

    function testParameterParser<Parameters extends Record<string, unknown>>(
        parameterToParse: Record<string, unknown>,
        builders: IParameterBuilders<Parameters>,
        expectedParameters: Parameters
    ): void {
        const parameterContainer = new ParameterContainer(parameterToParse, logger.nextIndent);
        const parameterParser = new ParameterParser<Parameters>(builders, logger.nextIndent);
        parameterParser.parse(parameterContainer);
        expect(parameterParser.parameters).to.be.deep.equal(expectedParameters);
    }

    it('empty parameter', () => {
        testParameterParser<Record<string, unknown>>({}, {}, {});
    });

    it('only primitive types and object', () => {
        testParameterParser<{
            value1: string;
            value2: number;
            value3: object | null;
        }>({
            value1: 'asdf',
            value2: 12,
            value3: {
                subValue1: 'ghjk',
                subValue2: 98
            }
        }, {
            value1: new ValueParameterBuilder('string'),
            value2: new ValueParameterBuilder('number'),
            value3: new ValueParameterBuilder('object')
        }, {
            value1: 'asdf',
            value2: 12,
            value3: {
                subValue1: 'ghjk',
                subValue2: 98
            }
        });
    });

    it('only builders', () => {
        testParameterParser<{
            value1: StringClassType;
            value2: NumberClassType;
            value3: ObjectClassType;
        }>({
            value1: 'v1',
            value2: 12.50,
            value3: {
                v1: 'a',
                v2: 3
            }
        }, {
            value1: new ParameterBuilder('string', StringClassType.fromString),
            value2: new ParameterBuilder('number', NumberClassType.fromNumber),
            value3: new ParameterBuilder('object', ObjectClassType.fromObject)
        }, {
            value1: new StringClassType('v1'),
            value2: new NumberClassType(12.50),
            value3: new ObjectClassType('a', 3)
        });
    });

    it('primitive types, object and builders', () => {
        testParameterParser<{
            value1: number;
            value2: StringClassType;
        }>({
            value1: 23.9,
            value2: 'v3'
        }, {
            value1: new ValueParameterBuilder('number'),
            value2: new ParameterBuilder('string', StringClassType.fromString)
        }, {
            value1: 23.9,
            value2: new StringClassType('v3')
        });
    });

    it('builder throws', () => {
        expect(() => {
            testParameterParser<{
                value1: StringClassType;
            }>({
                value1: 'invalid'
            }, {
                value1: new ParameterBuilder('string', StringClassType.fromString)
            }, {
                value1: new StringClassType('v1')
            });
        }).to.throw('internal');
    });

    it('guard builder', () => {
        testParameterParser<{
            value: 'a' | 'b';
        }>({
            value: 'b'
        }, {
            value: new GuardParameterBuilder('string', (value: string): value is 'a' | 'b' => value === 'a' || value === 'b')
        }, {
            value: 'b'
        });
    });

    it('optional builder', () => {
        testParameterParser<{
            value1a: number | undefined;
            value1b: number | undefined;
            value2a: 'a' | 'b' | undefined;
            value2b: 'a' | 'b' | undefined;
            value3a: DatabaseType | undefined;
            value3b: DatabaseType | undefined;
            value4a: undefined;
        }>({
            value1a: 12,
            // eslint-disable-next-line no-undefined
            value1b: undefined,
            value2a: 'a',
            // eslint-disable-next-line no-undefined
            value2b: undefined,
            value3a: 'testing',
            // eslint-disable-next-line no-undefined
            value3b: undefined,
            // eslint-disable-next-line no-undefined
            value4a: undefined
        }, {
            value1a: new OptionalParameterBuilder(new ValueParameterBuilder('number')),
            value1b: new OptionalParameterBuilder(new ValueParameterBuilder('number')),
            value2a: new OptionalParameterBuilder(new GuardParameterBuilder('string', (value: string): value is 'a' | 'b' => value === 'a' || value === 'b')),
            value2b: new OptionalParameterBuilder(new GuardParameterBuilder('string', (value: string): value is 'a' | 'b' => value === 'a' || value === 'b')),
            value3a: new OptionalParameterBuilder(new ParameterBuilder('string', DatabaseType.fromString)),
            value3b: new OptionalParameterBuilder(new ParameterBuilder('string', DatabaseType.fromString)),
            value4a: new OptionalParameterBuilder(new ParameterBuilder('undefined', (value: undefined) => value))
        }, {
            value1a: 12,
            // eslint-disable-next-line no-undefined
            value1b: undefined,
            value2a: 'a',
            // eslint-disable-next-line no-undefined
            value2b: undefined,
            value3a: new DatabaseType('testing'),
            // eslint-disable-next-line no-undefined
            value3b: undefined,
            // eslint-disable-next-line no-undefined
            value4a: undefined
        });
    });

    it('invalid type', () => {
        expect(() => {
            testParameterParser<{
                value: string;
            }>({
                value: 'asdf'
            }, {
                value: { expectedTypes: new Set(['number']), build: (value: number) => value.toString() }
            }, {
                value: 'asdf'
            });
        }).to.throw('invalid-argument');
    });

    it('invalid undefined type', () => {
        expect(() => {
            testParameterParser<{
                value: string;
            }>({
                // eslint-disable-next-line no-undefined
                value: undefined
            }, {
                value: { expectedTypes: new Set(['number']), build: (value: number) => value.toString() }
            }, {
                value: 'asdf'
            });
        }).to.throw('invalid-argument');
    });

    it('failed guard builder', () => {
        expect(() => {
            testParameterParser<{
                value: 'a' | 'b';
            }>({
                value: 'c'
            }, {
                value: new GuardParameterBuilder('string', (value: string): value is 'a' | 'b' => value === 'a' || value === 'b')
            }, {
                value: 'a'
            });
        }).to.throw('invalid-argument');
    });
});
