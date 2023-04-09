import { expect } from 'chai';
import { Crypter } from '../src/crypter/Crypter';
import { FixedLength } from '../src/crypter/FixedLength';
import { DatabaseType } from '../src/DatabaseType';
import { Logger, VerboseType } from '../src/logger';
import { ParameterBuilder } from '../src/parameter/ParameterBuilder';
import { ParameterContainer } from '../src/parameter/ParameterContainer';

describe('Parameter container', () => {
    const cryptionKeys: Crypter.Keys = {
        encryptionKey: new FixedLength(Uint8Array.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F]), 32),
        initialisationVector: new FixedLength(Uint8Array.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F]), 16),
        vernamKey: new FixedLength(Uint8Array.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F]), 32)
    };
    const logger = Logger.start(new VerboseType('coloredVerbose'), 'paramter container test');

    function createParameterContainer(data: Record<PropertyKey, unknown> & { databaseType: DatabaseType }): ParameterContainer {
        return new ParameterContainer(data, (databaseType: DatabaseType) => {
            return {
                cryptionKeys: cryptionKeys,
                callSecretKey: '',
                databaseUrl: ''
            };
        }, logger.nextIndent);
    }

    it('parameters invalid', () => {
        expect(() => createParameterContainer({
            databaseType: new DatabaseType('testing')
        })).to.throw();
        expect(() => createParameterContainer({
            databaseType: new DatabaseType('testing'),
            parameters: 0
        })).to.throw();
    });

    it('get optional parameter invalid / undefined', () => {
        const crypter = new Crypter(cryptionKeys);
        const parameterContainer = createParameterContainer({
            databaseType: new DatabaseType('testing'),
            parameters: crypter.encodeEncrypt({
                value1: undefined,
                value2: null,
                value3: 'asdf'
            })
        });
        expect(parameterContainer.optionalParameter('value0', ParameterBuilder.value('number'), logger.nextIndent)).to.be.undefined;
        expect(parameterContainer.optionalParameter('value1', ParameterBuilder.value('number'), logger.nextIndent)).to.be.undefined;
        expect(parameterContainer.optionalParameter('value2', ParameterBuilder.value('number'), logger.nextIndent)).to.be.undefined;
        expect(() => parameterContainer.optionalParameter('value3', ParameterBuilder.value('number'), logger.nextIndent)).to.throw();
    });

    it('get optional parameter', () => {
        const crypter = new Crypter(cryptionKeys);
        const parameterContainer = createParameterContainer({
            databaseType: new DatabaseType('testing'),
            parameters: crypter.encodeEncrypt({
                value1: true,
                value2: 'asdf',
                value3: 12,
                value5: { v: 'asdf' },
                value6: null
            })
        });
        expect(parameterContainer.optionalParameter('value1', ParameterBuilder.value('boolean'), logger.nextIndent)).to.be.true;
        expect(parameterContainer.optionalParameter('value2', ParameterBuilder.value('string'), logger.nextIndent)).to.be.equal('asdf');
        expect(parameterContainer.optionalParameter('value3', ParameterBuilder.value('number'), logger.nextIndent)).to.be.equal(12);
        expect(parameterContainer.optionalParameter('value5', ParameterBuilder.value('object'), logger.nextIndent)).to.be.deep.equal({ v: 'asdf' });
        expect(parameterContainer.optionalParameter('value6', ParameterBuilder.value('undefined'), logger.nextIndent)).to.be.undefined;
    });

    it('get undefined parameter', () => {
        const crypter = new Crypter(cryptionKeys);
        const parameterContainer = createParameterContainer({
            databaseType: new DatabaseType('testing'),
            parameters: crypter.encodeEncrypt({
                value0: undefined
            })
        });
        expect(() => parameterContainer.parameter('value0', ParameterBuilder.value('number'), logger.nextIndent)).to.throw();
    });

    it('get parameter', () => {
        const crypter = new Crypter(cryptionKeys);
        const parameterContainer = createParameterContainer({
            databaseType: new DatabaseType('testing'),
            parameters: crypter.encodeEncrypt({
                value0: undefined,
                value1: true,
                value2: 'asdf',
                value3: 12,
                value5: { v: 'asdf' },
                value6: null
            })
        });
        expect(parameterContainer.parameter('value0', ParameterBuilder.value('undefined'), logger.nextIndent)).to.be.undefined;
        expect(parameterContainer.parameter('value1', ParameterBuilder.value('boolean'), logger.nextIndent)).to.be.true;
        expect(parameterContainer.parameter('value2', ParameterBuilder.value('string'), logger.nextIndent)).to.be.equal('asdf');
        expect(parameterContainer.parameter('value3', ParameterBuilder.value('number'), logger.nextIndent)).to.be.equal(12);
        expect(parameterContainer.parameter('value5', ParameterBuilder.value('object'), logger.nextIndent)).to.be.deep.equal({ v: 'asdf' });
        expect(parameterContainer.parameter('value6', ParameterBuilder.value('undefined'), logger.nextIndent)).to.be.undefined;
    });
});
