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

    public unsorted(value: T extends Array<infer Element> ? Element[] : never, message?: string) {
        assert.fail('Use deep unsorted array.');
    }
}

export class ExpectToBeDeep<T> {
    public constructor(
        private readonly _value: T
    ) {}

    public equal(value: T, message?: string): Chai.Assertion {
        return chai_expect(this._value).to.be.deep.equal(value, message);
    }

    public unsorted(value: T extends Array<infer Element> ? Element[] : never, message?: string) {
        assert(Array.isArray(this._value));
        chai_expect(this._value.length).to.be.equal(value.length);
        for (const element of value) {
            // eslint-disable-next-line eqeqeq
            const index = this._value.findIndex(e => this.deepEqual(e, element));
            if (index === -1)
                assert.fail(message ?? `Couldn't find element: ${JSON.stringify(element)}`);
            this._value.splice(index, 1);
        }
    }

    private deepEqual(value1: unknown, value2: unknown): boolean {
        if (typeof value1 !== 'object' || value1 === null || typeof value2 !== 'object' || value2 === null)
            return value1 === value2;
        if (Array.isArray(value1) || Array.isArray(value2)) {
            if (!Array.isArray(value1) || !Array.isArray(value2))
                return false;
            if (value1.length !== value2.length)
                return false;
            for (let i = 0; i < value1.length; i++) {
                if (!this.deepEqual(value1[i], value2[i]))
                    return false;
            }
            return true;
        }
        const _value1 = this.removeUndefined(value1);
        const _value2 = this.removeUndefined(value2);
        if (Object.keys(_value1).length !== Object.keys(_value2).length)
            return false;
        for (const key of Object.keys(_value1)) {
            if (!(key in _value2))
                return false;
            if (!this.deepEqual(_value1[key as keyof typeof _value1], _value2[key as keyof typeof _value2]))
                return false;
        }
        return true;
    }

    private removeUndefined(value: object): object {
        const v: Record<string, unknown> = {};
        for (const key of Object.keys(value)) {
            if (value[key as keyof typeof value] !== undefined)
                v[key] = value[key as keyof typeof value];
        }
        return v;
    }
}

export class ExpectResult<T> {
    public constructor(
        private readonly result: FirebaseFunction.Result<T>
    ) {}

    public get success(): ExpectToBe<T> | ExpectToBeDeep<T> {
        if (this.result.state === 'failure') {
            console.error(this.result.error.code, this.result.error.message);
            console.error(this.result.error);
        }
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
