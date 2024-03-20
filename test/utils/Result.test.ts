import { Result } from '../../src';
import { expect } from '../../testSrc';

describe('Result', () => {
    it('success', () => {
        const result: Result<string, Error> = Result.success<string>('asdf');
        expect(result).to.be.success.equal('asdf');
        expect(result.get()).to.be.equal('asdf');
        expect(result.value).to.be.equal('asdf');
        expect(result.error).to.be.equal(null);
        expect(result.valueOrError).to.be.equal('asdf');
        expect(result.map<string>(value => `${value}_`)).to.be.success.equal('asdf_');
        expect(result.mapError<Error>(value => ({
            ...value,
            message: `${value.message}_`
        }))).to.be.success.equal('asdf');
        expect(Result.isSuccess(result)).to.be.equal(true);
        expect(Result.isFailure(result)).to.be.equal(false);
        // eslint-disable-next-line no-undefined
        expect(Result.success()).to.be.success.equal(undefined);
    });

    it('failure', () => {
        const result: Result<string, Error> = Result.failure<Error>({
            name: 'opiu',
            message: 'nrtz'
        });
        expect(result).to.be.failure.equal({
            name: 'opiu',
            message: 'nrtz'
        });
        expect(() => result.get()).to.throw('nrtz');
        expect(result.value).to.be.equal(null);
        expect(result.error).to.be.deep.equal({
            name: 'opiu',
            message: 'nrtz'
        });
        expect(result.valueOrError).to.be.deep.equal({
            name: 'opiu',
            message: 'nrtz'
        });
        expect(result.map<string>(value => `${value}_`)).to.be.failure.equal({
            name: 'opiu',
            message: 'nrtz'
        });
        expect(result.mapError<Error>(value => ({
            ...value,
            message: `${value.message}_`
        }))).to.be.failure.equal({
            name: 'opiu',
            message: 'nrtz_'
        });
        expect(Result.isSuccess(result)).to.be.equal(false);
        expect(Result.isFailure(result)).to.be.equal(true);
    });
});
