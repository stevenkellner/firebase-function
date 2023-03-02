import { assert, expect as chai_expect } from 'chai';
import { type FunctionsErrorCode } from 'firebase-functions/lib/common/providers/https';
import { type FirebaseFunction } from '../FirebaseFunction';

export function expect<T>(value: T): Expect<T> {
    return new Expect<T>(value);
}

export function expectResult<T>(result: FirebaseFunction.Result<T>): ExpectResult<T> {
    return new ExpectResult<T>(result);
}

export function expectHttpsError(execute: () => void, code: FunctionsErrorCode) {
    try {
        execute();
        chai_expect.fail('Expected to throw an error.');
    } catch (error) {
        chai_expect(error).to.have.ownProperty('httpErrorCode');
        chai_expect(error).to.have.ownProperty('code');
        assert(typeof error === 'object' && error !== null && 'code' in error);
        chai_expect(error.code).to.be.equal(code);
    }
}

export class Expect<T> {
    public constructor(
        private readonly _value: T
    ) {}

    public value<Key extends keyof T>(key: Key): Expect<T[Key]> {
        return new Expect<T[Key]>(this._value[key]);
    }

    public get to(): ExpectTo<T> {
        return new ExpectTo<T>(this._value);
    }
}

export class ExpectTo<T> {
    public constructor(
        private readonly _value: T
    ) {}

    public get be(): ExpectToBe<T> {
        return new ExpectToBe<T>(this._value);
    }
}

export class ExpectToBe<T> {
    public constructor(
        private readonly _value: T
    ) {}

    public get deep(): ExpectToBeDeep<T> {
        return new ExpectToBeDeep<T>(this._value);
    }

    public equal(value: T, message?: string): Chai.Assertion {
        return chai_expect(this._value).to.be.equal(value, message);
    }
}

export class ExpectToBeDeep<T> {
    public constructor(
        private readonly _value: T
    ) {}

    public equal(value: T, message?: string): Chai.Assertion {
        return chai_expect(this._value).to.be.deep.equal(value, message);
    }
}

export class ExpectResult<T> {
    public constructor(
        private readonly result: FirebaseFunction.Result<T>
    ) {}

    public get success(): ExpectToBe<T> | ExpectToBeDeep<T> {
        expect<'failure' | 'success'>(this.result.state).to.be.equal('success');
        assert(this.result.state === 'success');
        return typeof this.result.value === 'object' ? new ExpectToBeDeep<T>(this.result.value) : new ExpectToBe<T>(this.result.value);
    }

    public get failure(): ExpectToBeDeep<{
        code: FunctionsErrorCode;
        message: string;
    }> {
        expect<'failure' | 'success'>(this.result.state).to.be.equal('failure');
        assert(this.result.state === 'failure');
        return new ExpectToBeDeep({
            code: this.result.error.code,
            message: this.result.error.message
        });
    }
}
