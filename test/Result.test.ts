import { expect } from 'chai';
import { Result } from '../src/Result';

describe('Result', () => {
    it('success', () => {
        const result: Result<string, Error> = Result.success<string>('asdf');
        expect(result).to.be.deep.equal({
            state: 'success',
            value: 'asdf'
        });
        expect(result.get()).to.be.equal('asdf');
        expect(result.value).to.be.equal('asdf');
        expect(result.error).to.be.null;
        expect(result.valueOrError).to.be.equal('asdf');
        expect(result.map<string>(v => v + '_')).to.be.deep.equal({
            state: 'success',
            value: 'asdf_'
        });
        expect(result.mapError<Error>(v => {
            return {
                ...v,
                message: v.message + '_'
            };
        })).to.be.deep.equal({
            state: 'success',
            value: 'asdf'
        });
        expect(Result.isSuccess(result)).to.be.true;
        expect(Result.isFailure(result)).to.be.false;
        expect(Result.success()).to.be.deep.equal({
            state: 'success',
            value: undefined
        });
    });

    it('failure', () => {
        const result: Result<string, Error> = Result.failure<Error>({
            name: 'opiu',
            message: 'nrtz'
        });
        expect(result).to.be.deep.equal({
            state: 'failure',
            error: {
                name: 'opiu',
                message: 'nrtz'
            }
        });
        try {
            result.get();
            expect.fail();
        } catch (error) {
            expect(error).to.be.deep.equal({
                name: 'opiu',
                message: 'nrtz'
            });
        }
        expect(result.value).to.be.null;
        expect(result.error).to.be.deep.equal({
            name: 'opiu',
            message: 'nrtz'
        });
        expect(result.valueOrError).to.be.deep.equal({
            name: 'opiu',
            message: 'nrtz'
        });
        expect(result.map<string>(v => v + '_')).to.be.deep.equal({
            state: 'failure',
            error: {
                name: 'opiu',
                message: 'nrtz'
            }
        });
        expect(result.mapError<Error>(v => {
            return {
                ...v,
                message: v.message + '_'
            };
        })).to.be.deep.equal({
            state: 'failure',
            error: {
                name: 'opiu',
                message: 'nrtz_'
            }
        });
        expect(Result.isSuccess(result)).to.be.false;
        expect(Result.isFailure(result)).to.be.true;
    });
});
