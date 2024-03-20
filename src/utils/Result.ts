export type Result<T, E extends Error> = Result.Success<T> | Result.Failure<E>;

type ErrorType = Error;

export namespace Result {

    export type Value<R> = R extends Result<infer T, ErrorType> ? T : never;

    export type Error<R> = R extends Result<unknown, infer E> ? E : never;

    export class Success<T> {
        public readonly state = 'success';

        public constructor(
            public readonly value: T
        ) {}

        // eslint-disable-next-line @typescript-eslint/class-literal-property-style
        public get error(): null {
            return null;
        }

        public get valueOrError(): T {
            return this.value;
        }

        public get(): T {
            return this.value;
        }

        public map<T2>(mapper: (value: T) => T2): Result<T2, never> {
            return new Result.Success<T2>(mapper(this.value));
        }

        public mapError(): Result<T, never> {
            return this;
        }
    }

    export class Failure<E extends ErrorType> {
        public readonly state = 'failure';

        public constructor(
            public readonly error: E
        ) {}

        // eslint-disable-next-line @typescript-eslint/class-literal-property-style
        public get value(): null {
            return null;
        }

        public get valueOrError(): E {
            return this.error;
        }

        public get(): never {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw this.error;
        }

        public map(): Result<never, E> {
            return this;
        }

        public mapError<E2 extends ErrorType>(mapper: (value: E) => E2): Result<never, E2> {
            return new Result.Failure<E2>(mapper(this.error));
        }
    }

    export function success<T>(value: T): Result<T, never>;
    export function success(): Result<void, never>;
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    export function success<T>(value?: T): Result<T | void, never> {
        // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
        return new Result.Success<T | void>(value);
    }

    export function failure<E extends ErrorType>(error: E): Result<never, E> {
        return new Result.Failure<E>(error);
    }

    export function isSuccess<T, E extends ErrorType>(result: Result<T, E>): result is Result.Success<T> {
        return result.state === 'success';
    }

    export function isFailure<T, E extends ErrorType>(result: Result<T, E>): result is Result.Failure<E> {
        return result.state === 'failure';
    }
}
