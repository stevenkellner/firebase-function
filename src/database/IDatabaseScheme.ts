export type DatabaseValueType =
    | boolean
    | string
    | number
    | DatabaseValueType[]
    | { [key: string]: DatabaseValueType };

export interface DatabaseValue<Value extends DatabaseValueType, Crypted extends boolean> {

    readonly value: Value;

    readonly crypted: Crypted;
}

export namespace DatabaseValue {

    export type Value<T> = T extends DatabaseValue<infer Value, boolean> ? Value : never;

    export type Crypted<T> = T extends DatabaseValue<DatabaseValueType, infer Crypted> ? Crypted : never;
}

export type IDatabaseScheme =
    | DatabaseValue<DatabaseValueType, boolean>
    | { [key: string]: IDatabaseScheme };

export namespace IDatabaseScheme {

    export type Key<Scheme extends IDatabaseScheme> = Scheme extends DatabaseValue<DatabaseValueType, boolean> ? never : keyof Scheme;

    export type Child<Scheme extends IDatabaseScheme, K extends Key<Scheme>> = Scheme extends DatabaseValue<DatabaseValueType, boolean> ? never : Scheme[K];

    export type Children<Scheme extends IDatabaseScheme> = Scheme extends DatabaseValue<DatabaseValueType, boolean> ? true extends DatabaseValue.Crypted<Scheme> ? never : DatabaseValue.Value<Scheme>[keyof DatabaseValue.Value<Scheme>] : Scheme[keyof Scheme];

    export type UncryptedValue<Scheme extends IDatabaseScheme> = Scheme extends DatabaseValue<DatabaseValueType, boolean> ? true extends DatabaseValue.Crypted<Scheme> ? never : DatabaseValue.Value<Scheme> : never;

    export type CryptedValue<Scheme extends IDatabaseScheme> = Scheme extends DatabaseValue<DatabaseValueType, boolean> ? true extends DatabaseValue.Crypted<Scheme> ? DatabaseValue.Value<Scheme> : never : never;
}

export type DatabaseScheme<Scheme extends IDatabaseScheme> = Scheme;
