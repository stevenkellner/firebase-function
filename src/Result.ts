/**
 * Contains the value, if the result is success, or the error, if the result is failure.
 */
export type Result<T, E extends Error> = Result.Success<T> | Result.Failure<E>;

export namespace Result {

    /**
     * Contains the value, if the result is success.
     */
    export class Success<T> {
        /**
         * State of the result. `success` if result is Success, `failure` otherwise.
         */
        public readonly state = 'success';

        /**
         * Constructs the success result with the value of the result.
         * @param value Value of the result, if the result is success.
         */
        public constructor(
            public readonly value: T
        ) {}

        /**
         * Error of the result, if the result is failure.
         */
        public get error(): null {
            return null;
        }

        /**
         * Value of the result, if the result is success, or the error, if the result is failure.
         */
        public get valueOrError(): T {
            return this.value;
        }

        /**
         * Get the value of the result, if the result is success, or throws the error, if result is failure.
         * @returns Value of the result, if the result is success.
         */
        public get(): T {
            return this.value;
        }

        /**
         * Map the value of the result, if the result is success.
         * @param mapper Mapper to map the value.
         * @returns New result with mapped value.
         */
        public map<T2>(mapper: (value: T) => T2): Result<T2, never> {
            return new Result.Success<T2>(mapper(this.value));
        }

        /**
         * Map the error of the result, if the result is failure.
         * @param mapper Mapper to map the error.
         * @returns New result with mapped error.
         */
        public mapError(): Result<T, never> {
            return this;
        }
    }

    /**
     * Contains the error, if the result is failure.
     */
    export class Failure<E extends Error> {
        /**
         * State of the result. `success` if result is Success, `failure` otherwise.
         */
        public readonly state = 'failure';

        /**
         * Constructs the failure result with the error of the result.
         * @param error Error of the result, if the result is failure.
         */
        public constructor(
            public readonly error: E
        ) {}

        /**
         * Value of the result, if the result if success.
         */
        public get value(): null {
            return null;
        }

        /**
         * Value of the result, if the result is success, or the error, if the result is failure.
         */
        public get valueOrError(): E {
            return this.error;
        }

        /**
         * Get the value of the result, if the result is success, or throws the error, if result is failure.
         * @returns Value of the result, if the result is success.
         */
        public get(): never {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw this.error;
        }

        /**
         * Map the value of the result, if the result is success.
         * @param mapper Mapper to map the value.
         * @returns New result with mapped value.
         */
        public map(): Result<never, E> {
            return this;
        }

        /**
         * Map the error of the result, if the result is failure.
         * @param mapper Mapper to map the error.
         * @returns New result with mapped error.
         */
        public mapError<E2 extends Error>(mapper: (value: E) => E2): Result<never, E2> {
            return new Result.Failure<E2>(mapper(this.error));
        }
    }

    /**
     * Constructs the success result with the value of the result.
     * @param value Value of the result, if the result is success.
     */
    export function success<T>(value: T): Result<T, never>;
    export function success(): Result<void, never>;
    export function success<T>(value?: T): Result<T | void, never> {
        return new Result.Success<T | void>(value);
    }

    /**
     * Constructs the failure result with the error of the result.
     * @param error Error of the result, if the result is failure.
     */
    export function failure<E extends Error>(error: E): Result<never, E> {
        return new Result.Failure<E>(error);
    }

    /**
     * Indicates whether the specifed result is success.
     * @param result Result to check if it is success.
     * @returns `true` if specifed result is success, `false` otherwise.
     */
    export function isSuccess<T, E extends Error>(result: Result<T, E>): result is Result.Success<T> {
        return result.state === 'success';
    }

    /**
     * Indicates whether the specifed result is failure.
     * @param result Result to check if it is failure.
     * @returns `true` if specifed result is failure, `false` otherwise.
     */
    export function isFailure<T, E extends Error>(result: Result<T, E>): result is Result.Failure<E> {
        return result.state === 'failure';
    }
}
