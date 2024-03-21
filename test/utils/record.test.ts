import { entries, keys, mapRecord, values } from '../../src';
import { expect } from '../../testSrc';

describe('record', () => {
    const record = {
        k1: undefined,
        k2: 0,
        k3: [],
        k4: 'adsf',
        k5: {
            k6: 1
        }
    };

    it('keys', () => {
        expect(keys({})).to.be.deep.equal([]);
        expect(keys(record)).to.be.deep.equal(['k1', 'k2', 'k3', 'k4', 'k5']);
    });

    it('values', () => {
        expect(values({})).to.be.deep.equal([]);
        expect(values(record)).to.be.deep.equal([undefined, 0, [], 'adsf', { k6: 1 }]);
    });

    it('entries', () => {
        expect(entries({})).to.be.deep.equal([]);
        expect(entries(record)).to.be.deep.equal([
            { key: 'k1', value: undefined },
            { key: 'k2', value: 0 },
            { key: 'k3', value: [] },
            { key: 'k4', value: 'adsf' },
            { key: 'k5', value: { k6: 1 } }
        ]);
    });

    it('mapRecord', () => {
        expect(mapRecord({}, () => null)).to.be.deep.equal({});
        expect(mapRecord(record, (value, key) => `${key}: ${JSON.stringify(value)}`)).to.be.deep.equal({
            k1: 'k1: undefined',
            k2: 'k2: 0',
            k3: 'k3: []',
            k4: 'k4: "adsf"',
            k5: 'k5: {"k6":1}'
        });
    });
});
