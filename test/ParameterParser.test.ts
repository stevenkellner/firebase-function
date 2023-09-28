import { expect } from 'chai';
import { Crypter, FixedLength } from '../src/crypter';
import { DatabaseType, type FirebaseError, HttpsError } from '../src';
import { Logger, type ILogger, VerboseType } from '../src/logger';
import { GuardParameterBuilder, type IParameterBuilders, OptionalParameterBuilder, ParameterBuilder, ParameterContainer, ParameterParser, ValueParameterBuilder } from '../src/parameter';

function expectHttpsError(execute: () => void, code: FirebaseError.Code) {
    try {
        execute();
    } catch (error) {
        expect(error).to.have.ownProperty('httpErrorCode');
        expect(error).to.have.ownProperty('code');
        expect((error as { code: unknown }).code).to.be.equal(code);
        return;
    }
    expect.fail('Expected to throw an error.');
}

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
    const cryptionKeys: Crypter.Keys = {
        encryptionKey: new FixedLength(Uint8Array.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F]), 32),
        initialisationVector: new FixedLength(Uint8Array.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F]), 16),
        vernamKey: new FixedLength(Uint8Array.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F]), 32)
    };
    const crypter = new Crypter(cryptionKeys);
    const logger = Logger.start(new VerboseType('coloredVerbose'), 'parameter parser test');

    function testParameterParser<Parameters extends Record<string, unknown>>(
        parameterToParse: unknown,
        builders: IParameterBuilders<Parameters>,
        expectedParameters: Parameters & { databaseType: DatabaseType }
    ) {
        const parameterContainer = new ParameterContainer({
            databaseType: new DatabaseType('testing'),
            parameters: crypter.encodeEncrypt(parameterToParse)
        }, crypter, logger.nextIndent);
        const parameterParser = new ParameterParser<Parameters>(builders, logger.nextIndent);
        parameterParser.parse(parameterContainer);
        expect(parameterParser.parameters).to.be.deep.equal(expectedParameters);
    }

    it('get parameter before parsing', () => {
        expectHttpsError(() => {
            const parameterParser = new ParameterParser<{
                value: string;
            }>({
                value: new ValueParameterBuilder('string')
            }, logger.nextIndent);
            parameterParser.parameters;
        }, 'internal');
    });

    it('empty parameter', () => {
        testParameterParser<Record<string, unknown>>({}, {}, {
            databaseType: new DatabaseType('testing')
        });
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
            },
            databaseType: new DatabaseType('testing')
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
            value3: new ObjectClassType('a', 3),
            databaseType: new DatabaseType('testing')
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
            value2: new StringClassType('v3'),
            databaseType: new DatabaseType('testing')
        });
    });

    it('builder throws', () => {
        try {
            testParameterParser<{
                value1: StringClassType;
            }>({
                value1: 'invalid'
            }, {
                value1: new ParameterBuilder('string', StringClassType.fromString)
            }, {
                value1: new StringClassType('v1'),
                databaseType: new DatabaseType('testing')
            });
            expect(true).to.be.false;
        } catch (error) {
            expect(error).to.have.ownProperty('code');
            expect((error as { code: unknown }).code).to.be.equal('internal');
        }
    });

    it('also parse database type', () => {
        testParameterParser<{
            value1: string;
            databaseType: DatabaseType;
        }>({
            value1: 'as',
            databaseType: 'testing'
        }, {
            value1: new ValueParameterBuilder('string'),
            databaseType: new ParameterBuilder('string', DatabaseType.fromString)
        }, {
            value1: 'as',
            databaseType: new DatabaseType('testing')
        });
    });

    it('guard builder', () => {
        testParameterParser<{
            value: 'a' | 'b';
        }>({
            value: 'b'
        }, {
            value: new GuardParameterBuilder('string', (value: string): value is 'a' | 'b' => value === 'a' || value === 'b')
        }, {
            value: 'b',
            databaseType: new DatabaseType('testing')
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
            value1b: undefined,
            value2a: 'a',
            value2b: undefined,
            value3a: 'testing',
            value3b: undefined,
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
            value1b: undefined,
            value2a: 'a',
            value2b: undefined,
            value3a: new DatabaseType('testing'),
            value3b: undefined,
            value4a: undefined,
            databaseType: new DatabaseType('testing')
        });
    });

    it('invalid type', () => {
        expectHttpsError(() => {
            testParameterParser<{
                value: string;
            }>({
                value: 'asdf'
            }, {
                value: { expectedTypes: ['number'], build: (v: number) => v.toString() }
            }, {
                value: 'asdf',
                databaseType: new DatabaseType('testing')
            });
        }, 'invalid-argument');
    });

    it('invalid undefined type', () => {
        expectHttpsError(() => {
            testParameterParser<{
                value: string;
            }>({
                value: undefined
            }, {
                value: { expectedTypes: ['number'], build: (v: number) => v.toString() }
            }, {
                value: 'asdf',
                databaseType: new DatabaseType('testing')
            });
        }, 'invalid-argument');
    });

    it('failed guard builder', () => {
        expectHttpsError(() => {
            testParameterParser<{
                value: 'a' | 'b';
            }>({
                value: 'c'
            }, {
                value: new GuardParameterBuilder('string', (value: string): value is 'a' | 'b' => value === 'a' || value === 'b')
            }, {
                value: 'a',
                databaseType: new DatabaseType('testing')
            });
        }, 'invalid-argument');
    });
});
