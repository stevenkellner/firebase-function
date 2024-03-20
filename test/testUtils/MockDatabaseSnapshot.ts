/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { CryptedScheme, IDatabaseScheme, IDatabaseSnapshot } from '../../src/database';
import type { ObjectValue } from '../../src/types';

export class MockDatabaseSnapshot<DatabaseScheme extends IDatabaseScheme> implements IDatabaseSnapshot<DatabaseScheme> {
    public constructor(
        public readonly key: string | null,
        private readonly data: DatabaseScheme | null
    ) {}

    public get hasChildren(): boolean {
        return typeof this.data === 'object' && this.data !== null;
    }

    public get numberChildren(): number {
        if (typeof this.data !== 'object' || this.data === null)
            return 0;
        return Object.values(this.data).length;
    }

    public get exists(): boolean {
        return this.data !== null;
    }

    public value(crypted: 'decrypt'): true extends CryptedScheme.IsCrypted<DatabaseScheme> ? CryptedScheme.GetType<DatabaseScheme> : never;
    public value(): true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : DatabaseScheme;
    public value(crypted: 'plain' | 'decrypt' = 'plain'): DatabaseScheme | CryptedScheme.GetType<DatabaseScheme> {
        if (crypted === 'decrypt')
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return (this.data! as CryptedScheme<CryptedScheme.GetType<DatabaseScheme>>).value;
        return this.data!;
    }

    public hasChild(path: string): boolean {
        return typeof this.data === 'object' && this.data !== null && path in this.data;
    }

    public child<Key extends true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : keyof DatabaseScheme & string>(key: Key): IDatabaseSnapshot<DatabaseScheme extends Record<string, IDatabaseScheme> ? DatabaseScheme[Key] : never> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return new MockDatabaseSnapshot(key, this.data === null ? null as any : (this.data as DatabaseScheme extends Record<string, IDatabaseScheme> ? DatabaseScheme : never)[key]) as any;
    }

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    public forEach(action: (snapshot: IDatabaseSnapshot<ObjectValue<DatabaseScheme>>) => boolean | void): boolean {
        if (typeof this.data !== 'object' || this.data === null)
            return false;
        for (const entry of Object.entries(this.data)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const shouldBreak = action(new MockDatabaseSnapshot<ObjectValue<DatabaseScheme>>(entry[0], entry[1]));
            if (shouldBreak === true)
                return true;
        }
        return false;
    }

    public map<U>(transform: (snapshot: IDatabaseSnapshot<ObjectValue<DatabaseScheme>>) => U): U[] {
        const result: U[] = [];
        this.forEach(snapshot => {
            result.push(transform(snapshot));
        });
        return result;
    }

    public flatMap<U>(transform: (snapshot: IDatabaseSnapshot<ObjectValue<DatabaseScheme>>) => U[]): U[] {
        const result: U[] = [];
        this.forEach(snapshot => {
            for (const value of transform(snapshot))
                result.push(value);
        });
        return result;
    }

    public compactMap<U>(transform: (snapshot: IDatabaseSnapshot<ObjectValue<DatabaseScheme>>) => U | undefined | null): U[] {
        const result: U[] = [];
        this.forEach(snapshot => {
            const value = transform(snapshot);
            // eslint-disable-next-line no-undefined
            if (value !== undefined && value !== null)
                result.push(value);
        });
        return result;
    }

    public reduce<T>(initialValue: T, transform: (value: T, snapshot: IDatabaseSnapshot<ObjectValue<DatabaseScheme>>) => T): T {
        this.forEach(snapshot => {
            // eslint-disable-next-line no-param-reassign
            initialValue = transform(initialValue, snapshot);
        });
        return initialValue;
    }

    public reduceInto<T>(initialValue: T, transform: (value: T, snapshot: IDatabaseSnapshot<ObjectValue<DatabaseScheme>>) => void): T {
        this.forEach(snapshot => {
            transform(initialValue, snapshot);
        });
        return initialValue;
    }
}
