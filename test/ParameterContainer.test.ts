import { expect } from 'chai';
import { Crypter, FixedLength } from '../src/crypter';
import { Logger, VerboseType } from '../src/logger';
import { DatabaseType } from '../src';
import { ParameterContainer, ValueParameterBuilder } from '../src/parameter';

describe('Parameter container', () => {
    const cryptionKeys: Crypter.Keys = {
        encryptionKey: new FixedLength(Uint8Array.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F]), 32),
        initialisationVector: new FixedLength(Uint8Array.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F]), 16),
        vernamKey: new FixedLength(Uint8Array.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F]), 32)
    };
    const crypter = new Crypter(cryptionKeys);
    const logger = Logger.start(new VerboseType('coloredVerbose'), 'paramter container test');

    it('parameters invalid', () => {
        expect(() => new ParameterContainer({
            databaseType: new DatabaseType('testing')
        }, crypter, logger.nextIndent)).to.throw();
        expect(() => new ParameterContainer({
            databaseType: new DatabaseType('testing'),
            parameters: 0
        }, crypter, logger.nextIndent)).to.throw();
        const parameterContainer = new ParameterContainer({
            databaseType: new DatabaseType('testing'),
            parameters: crypter.encodeEncrypt(null)
        }, crypter, logger.nextIndent);
        expect(() => parameterContainer.parameter('value0', new ValueParameterBuilder('number'))).to.throw();
    });

    it('get invalid parameter', () => {
        const parameterContainer = new ParameterContainer({
            databaseType: new DatabaseType('testing'),
            parameters: crypter.encodeEncrypt({
                value1: undefined,
                value2: null,
                value3: 'asdf'
            })
        }, crypter, logger.nextIndent);
        expect(() => parameterContainer.parameter('value0', new ValueParameterBuilder('number'))).to.throw();
        expect(() => parameterContainer.parameter('value1', new ValueParameterBuilder('number'))).to.throw();
        expect(() => parameterContainer.parameter('value2', new ValueParameterBuilder('number'))).to.throw();
        expect(() => parameterContainer.parameter('value3', new ValueParameterBuilder('number'))).to.throw();
    });

    it('get parameter', () => {
        const parameterContainer = new ParameterContainer({
            databaseType: new DatabaseType('testing'),
            parameters: crypter.encodeEncrypt({
                value0: undefined,
                value1: true,
                value2: 'asdf',
                value3: 12,
                value5: { v: 'asdf' },
                value6: null
            })
        }, crypter, logger.nextIndent);
        expect(parameterContainer.parameter('value0', new ValueParameterBuilder('undefined'))).to.be.undefined;
        expect(parameterContainer.parameter('value1', new ValueParameterBuilder('boolean'))).to.be.true;
        expect(parameterContainer.parameter('value2', new ValueParameterBuilder('string'))).to.be.equal('asdf');
        expect(parameterContainer.parameter('value3', new ValueParameterBuilder('number'))).to.be.equal(12);
        expect(parameterContainer.parameter('value5', new ValueParameterBuilder('object'))).to.be.deep.equal({ v: 'asdf' });
        expect(parameterContainer.parameter('value6', new ValueParameterBuilder('object'))).to.be.null;
    });

    it('get parameter not crypted', () => {
        const parameterContainer = new ParameterContainer({
            databaseType: new DatabaseType('testing'),
            value0: undefined,
            value1: true,
            value2: 'asdf',
            value3: 12,
            value5: { v: 'asdf' },
            value6: null
        }, null, logger.nextIndent);
        expect(parameterContainer.parameter('value0', new ValueParameterBuilder('undefined'))).to.be.undefined;
        expect(parameterContainer.parameter('value1', new ValueParameterBuilder('boolean'))).to.be.true;
        expect(parameterContainer.parameter('value2', new ValueParameterBuilder('string'))).to.be.equal('asdf');
        expect(parameterContainer.parameter('value3', new ValueParameterBuilder('number'))).to.be.equal(12);
        expect(parameterContainer.parameter('value5', new ValueParameterBuilder('object'))).to.be.deep.equal({ v: 'asdf' });
        expect(parameterContainer.parameter('value6', new ValueParameterBuilder('object'))).to.be.null;
    });
});
