import { expect } from 'chai';
import { type FunctionsErrorCode } from 'firebase-functions/lib/common/providers/https';
import { Crypter } from '../src/crypter/Crypter';
import { FixedLength } from '../src/crypter/FixedLength';
import { DatabaseType } from '../src/DatabaseType';
import { HttpsError } from '../src/HttpsError';
import { Logger, type ILogger } from '../src/logger';
import { ParameterBuilder } from '../src/parameter/ParameterBuilder';
import { ParameterContainer } from '../src/parameter/ParameterContainer';
import { ParameterParser, type ParameterBuilders } from '../src/parameter/ParameterParser';

function expectHttpsError(execute: () => void, code: FunctionsErrorCode) {
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
    const logger = Logger.start('coloredVerbose', 'parameter parser test');

    function testParameterParser<Parameters extends Record<string, unknown>>(
        parameterToParse: unknown,
        builders: ParameterBuilders<Parameters>,
        expectedParameters: Parameters
    ) {
        const crypter = new Crypter(cryptionKeys);
        const parameterContainer = new ParameterContainer({
            databaseType: 'testing',
            parameters: crypter.encodeEncrypt(parameterToParse)
        }, (databaseType: DatabaseType) => cryptionKeys, logger.nextIndent);
        const parameterParser = new ParameterParser<Parameters>(builders, logger.nextIndent);
        parameterParser.parseParameters(parameterContainer);
        expect(parameterParser.parameters).to.be.deep.equal(expectedParameters);
    }

    it('get parameter before parsing', () => {
        expectHttpsError(() => {
            const parameterParser = new ParameterParser<{
                value: string;
            }>({
                value: ParameterBuilder.value('string')
            }, logger.nextIndent);
            parameterParser.parameters;
        }, 'internal');
    });

    it('empty parameter', () => {
        testParameterParser<Record<string, never>>({}, {}, {});
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
            value1: ParameterBuilder.value('string'),
            value2: ParameterBuilder.value('number'),
            value3: ParameterBuilder.value('object')
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
            value1: ParameterBuilder.build('string', StringClassType.fromString),
            value2: ParameterBuilder.build('number', NumberClassType.fromNumber),
            value3: ParameterBuilder.build('object', ObjectClassType.fromObject)
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
            value1: ParameterBuilder.value('number'),
            value2: ParameterBuilder.build('string', StringClassType.fromString)
        }, {
            value1: 23.9,
            value2: new StringClassType('v3')
        });
    });

    it('builder throws', () => {
        try {
            testParameterParser<{
                value1: StringClassType;
            }>({
                value1: 'invalid'
            }, {
                value1: ParameterBuilder.build('string', StringClassType.fromString)
            }, {
                value1: new StringClassType('v1')
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
            value1: ParameterBuilder.value('string'),
            databaseType: ParameterBuilder.build('string', DatabaseType.fromString)
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
            value: ParameterBuilder.guard('string', (value: string): value is 'a' | 'b' => value === 'a' || value === 'b')
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
            value4b: undefined;
        }>({
            value1a: 12,
            value1b: undefined,
            value2a: 'a',
            value2b: undefined,
            value3a: 'testing',
            value3b: undefined,
            value4a: undefined,
            value4b: null
        }, {
            value1a: ParameterBuilder.optional(ParameterBuilder.value('number')),
            value1b: ParameterBuilder.optional(ParameterBuilder.value('number')),
            value2a: ParameterBuilder.optional(ParameterBuilder.guard('string', (value: string): value is 'a' | 'b' => value === 'a' || value === 'b')),
            value2b: ParameterBuilder.optional(ParameterBuilder.guard('string', (value: string): value is 'a' | 'b' => value === 'a' || value === 'b')),
            value3a: ParameterBuilder.optional(ParameterBuilder.build('string', DatabaseType.fromString)),
            value3b: ParameterBuilder.optional(ParameterBuilder.build('string', DatabaseType.fromString)),
            value4a: ParameterBuilder.optional(ParameterBuilder.build('undefined', (value: undefined) => value)),
            value4b: ParameterBuilder.optional(ParameterBuilder.build('undefined', (value: undefined) => value))
        }, {
            value1a: 12,
            value1b: undefined,
            value2a: 'a',
            value2b: undefined,
            value3a: new DatabaseType('testing'),
            value3b: undefined,
            value4a: undefined,
            value4b: undefined
        });
    });

    it('invalid type', () => {
        expectHttpsError(() => {
            testParameterParser<{
                value: string;
            }>({
                value: 'asdf'
            }, {
                value: new ParameterBuilder(['number'], v => v.toString())
            }, {
                value: 'asdf'
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
                value: new ParameterBuilder(['number'], v => v.toString())
            }, {
                value: 'asdf'
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
                value: ParameterBuilder.guard('string', (value: string): value is 'a' | 'b' => value === 'a' || value === 'b')
            }, {
                value: 'a'
            });
        }, 'invalid-argument');
    });
});
