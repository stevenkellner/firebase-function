export type ValidDatabaseSchemeType =
    | boolean
    | string
    | number
    | null
    | IDatabaseScheme[]
    | { [key: string]: IDatabaseScheme };

export interface CryptedScheme<T extends ValidDatabaseSchemeType> {
    value: T;
    crypted: true;
}

export namespace CryptedScheme {
    export type IsCrypted<T extends IDatabaseScheme> = T extends CryptedScheme<ValidDatabaseSchemeType> ? true : never;

    export type GetType<T extends IDatabaseScheme> = T extends CryptedScheme<infer Scheme> ? Scheme : never;
}

export type IDatabaseScheme =
    | ValidDatabaseSchemeType
    | CryptedScheme<ValidDatabaseSchemeType>;
