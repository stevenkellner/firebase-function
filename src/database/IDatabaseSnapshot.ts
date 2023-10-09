import type { CryptedScheme, IDatabaseScheme } from './IDatabaseScheme';
import type { ObjectValue } from '../types/utils';

export interface IDatabaseSnapshot<DatabaseScheme extends IDatabaseScheme> {
    readonly hasChildren: boolean;
    readonly numberChildren: number;
    readonly key: string | null;
    readonly exists: boolean;

    value(crypted: 'decrypt'): true extends CryptedScheme.IsCrypted<DatabaseScheme> ? CryptedScheme.GetType<DatabaseScheme> : never;
    value(): true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : DatabaseScheme;

    hasChild(path: string): boolean;
    child<Key extends true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : (keyof DatabaseScheme & string)>(key: Key): IDatabaseSnapshot<DatabaseScheme extends Record<string, IDatabaseScheme> ? DatabaseScheme[Key] : never>;

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    forEach(action: (snapshot: IDatabaseSnapshot<ObjectValue<DatabaseScheme>>) => boolean | void): boolean;
    map<U>(transform: (snapshot: IDatabaseSnapshot<ObjectValue<DatabaseScheme>>) => U): U[];
    flatMap<U>(transform: (snapshot: IDatabaseSnapshot<ObjectValue<DatabaseScheme>>) => U[]): U[];
    compactMap<U>(transform: (snapshot: IDatabaseSnapshot<ObjectValue<DatabaseScheme>>) => U | undefined | null): U[];
    reduce<T>(initialValue: T, transform: (value: T, snapshot: IDatabaseSnapshot<ObjectValue<DatabaseScheme>>) => T): T;
    reduceInto<T>(initialValue: T, transform: (value: T, snapshot: IDatabaseSnapshot<ObjectValue<DatabaseScheme>>) => void): T;
}
