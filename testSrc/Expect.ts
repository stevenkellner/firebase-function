import * as functions from 'firebase-functions';
import type { Result } from '../src/utils';
import { assert, AssertionError, expect as chaiExpect } from 'chai';

function isFirebaseErrorCode(code: string): code is functions.https.FunctionsErrorCode {
    return [
        'ok', 'cancelled', 'unknown', 'invalid-argument', 'deadline-exceeded', 'not-found', 'already-exists',
        'permission-denied', 'resource-exhausted', 'failed-precondition', 'aborted', 'out-of-range', 'unimplemented',
        'internal', 'unavailable', 'data-loss', 'unauthenticated'
    ].includes(code);
}

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
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

    public get success(): ExpectToBe<Result.Value<T>> | ExpectToBeDeep<Result.Value<T>> {
        assert(typeof this.value === 'object' && this.value !== null && 'state' in this.value && (this.value.state === 'failure' || this.value.state === 'success'));
        const result = this.value as unknown as Result<Result.Value<T>, Result.Error<T>>;
        chaiExpect(result.state).to.be.equal('success');
        assert(result.state === 'success');
        return typeof result.value === 'object' ? new ExpectToBeDeep<Result.Value<T>>(result.value) : new ExpectToBe<Result.Value<T>>(result.value);
    }

    public get failure(): ExpectToBeDeep<Result.Error<T>> {
        assert(typeof this.value === 'object' && this.value !== null && 'state' in this.value && (this.value.state === 'failure' || this.value.state === 'success'));
        const result = this.value as unknown as Result<Result.Value<T>, Result.Error<T>>;
        chaiExpect(result.state).to.be.equal('failure');
        assert(result.state === 'failure');
        return new ExpectToBeDeep(result.error);
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
    public throw(firebaseErrorCode: functions.https.FunctionsErrorCode, message?: string): Chai.Assertion;
    public throw(expected?: string | RegExp | undefined | functions.https.FunctionsErrorCode, message?: string): Chai.Assertion {
        if (typeof expected === 'string' && isFirebaseErrorCode(expected)) {
            const executeValue = this._value as () => unknown;
            try {
                executeValue();
                return chaiExpect.fail('Expected to throw an error.');
            } catch (error) {
                chaiExpect(error).to.have.ownProperty('httpErrorCode');
                chaiExpect(error).to.have.ownProperty('code');
                return chaiExpect((error as { code: unknown }).code).to.be.equal(expected);
            }
        }
        return chaiExpect(this._value).to.throw(expected, message);
    }

    public async awaitThrow(): Promise<void> {
        const executeValue = this._value as () => Promise<unknown>;
        await executeValue()
            .then(() => chaiExpect.fail('Expected to throw an error.'))
            .catch(error => {
                if (error instanceof AssertionError)
                    throw error as Error;
            });
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

export namespace expect {
    export function fail(message?: string): never {
        chaiExpect.fail(message);
    }
}
