import { DatabaseType, DummyLogger } from '../src';
import { expect } from 'chai';

describe('DatabaseType', () => {
    it('fromString', () => {
        expect(() => DatabaseType.fromString('invalid', new DummyLogger())).to.throw();
        expect(DatabaseType.fromString('release', new DummyLogger())).to.be.deep.equal(new DatabaseType('release'));
        expect(DatabaseType.fromString('debug', new DummyLogger())).to.be.deep.equal(new DatabaseType('debug'));
        expect(DatabaseType.fromString('testing', new DummyLogger())).to.be.deep.equal(new DatabaseType('testing'));
    });
});
