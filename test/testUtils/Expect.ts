import { FirebaseError, type FirebaseResult } from '../../src/types';
import { assert, expect as chaiExpect } from 'chai';

export class ExpectToBeDeep<T> {
    public constructor(
        public readonly value: T
    ) {}

    public equal(value: T, message?: string): Chai.Assertion {
        return chaiExpect(this.value).to.be.deep.equal(value, message);
    }

    public unsorted(value: T extends (infer Element)[] ? Element[] : never, message?: string): void {
        assert(Array.isArray(this.value));
        chaiExpect(this.value.length).to.be.equal(value.length);
        for (const element of value) {
            const index = this.value.findIndex(elem => this.deepEqual(elem, element));
            if (index === -1)
                assert.fail(message ?? `Couldn't find element: ${JSON.stringify(element)}`);
            this.value.splice(index, 1);
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
        const object: Record<string, unknown> = {};
        for (const key of Object.keys(value)) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-undefined
            if (value[key as keyof typeof value] !== undefined)
                object[key] = value[key as keyof typeof value];
        }
        return object;
    }
}

export class ExpectToBe<T> {
    public constructor(
        public readonly value: T
    ) {}

    public get deep(): ExpectToBeDeep<T> {
        return new ExpectToBeDeep<T>(this.value);
    }

    public equal(value: T, message?: string): Chai.Assertion {
        return chaiExpect(this.value).to.be.equal(value, message);
    }
}

export class ExpectTo<T> {
    public constructor(
        private readonly _value: T
    ) {}

    public get be(): ExpectToBe<T> {
        return new ExpectToBe<T>(this._value);
    }

    public throw(expected?: string | RegExp | undefined, message?: string): Chai.Assertion;
    public throw(firebaseErrorCode: FirebaseError.Code, message?: string): Chai.Assertion;
    public throw(expected?: string | RegExp | undefined | FirebaseError.Code, message?: string): Chai.Assertion {
        if (typeof expected === 'string' && FirebaseError.isFirebaseErrorCode(expected)) {
            const executeValue = this._value as () => unknown;
            try {
                executeValue();
                chaiExpect.fail('Expected to throw an error.');
            } catch (error) {
                chaiExpect(error).to.have.ownProperty('httpErrorCode');
                chaiExpect(error).to.have.ownProperty('code');
                return chaiExpect((error as { code: unknown }).code).to.be.equal(expected);
            }
        }
        return chaiExpect(this._value).to.throw(expected, message);
    }
}

export class Expect<T> {
    public constructor(
        private readonly _value: T
    ) {}

    public get to(): ExpectTo<T> {
        return new ExpectTo<T>(this._value);
    }

    public value<Key extends keyof T>(key: Key): Expect<T[Key]> {
        return new Expect<T[Key]>(this._value[key]);
    }
}

export function expect<T>(value: T): Expect<T> {
    return new Expect<T>(value);
}

// TODO: remove
export class ExpectResult<T> {
    public constructor(
        private readonly result: FirebaseResult<T>
    ) {}

    public get success(): ExpectToBe<T> | ExpectToBeDeep<T> {
        if (this.result.state === 'failure') {
            // eslint-disable-next-line no-console
            console.error(this.result.error.code, this.result.error.message);
            // eslint-disable-next-line no-console
            console.error(this.result.error);
        }
        expect<'failure' | 'success'>(this.result.state).to.be.equal('success');
        assert(this.result.state === 'success');
        return typeof this.result.value === 'object' ? new ExpectToBeDeep<T>(this.result.value) : new ExpectToBe<T>(this.result.value);
    }

    public get failure(): ExpectToBeDeep<{
        code: FirebaseError.Code;
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

export function expectResult<T>(result: FirebaseResult<T>): ExpectResult<T> {
    return new ExpectResult<T>(result);
}

