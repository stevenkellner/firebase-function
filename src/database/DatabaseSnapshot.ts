import type * as admin from 'firebase-admin';
import type { CryptedScheme, IDatabaseScheme } from './IDatabaseScheme';
import type { IDatabaseSnapshot } from './IDatabaseSnapshot';
import type { ObjectValue } from '../types/utils';

export class DatabaseSnapshot<DatabaseScheme extends IDatabaseScheme> implements IDatabaseSnapshot<DatabaseScheme> {
    public constructor(
        private readonly snapshot: admin.database.DataSnapshot
    ) {}

    public get hasChildren(): boolean {
        return this.snapshot.hasChildren();
    }

    public get numberChildren(): number {
        return this.snapshot.numChildren();
    }

    public get key(): string | null {
        return this.snapshot.key;
    }

    public get exists(): boolean {
        return this.snapshot.exists();
    }

    public child<Key extends true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : (keyof DatabaseScheme & string)>(key: Key): DatabaseSnapshot<DatabaseScheme extends Record<string, IDatabaseScheme> ? DatabaseScheme[Key] : never> {
        return new DatabaseSnapshot(this.snapshot.child(key.replaceAll('/', '_')));
    }

    public value(crypted: 'decrypt'): true extends CryptedScheme.IsCrypted<DatabaseScheme> ? CryptedScheme.GetType<DatabaseScheme> : never;
    public value(): true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : DatabaseScheme;
    public value(): DatabaseScheme | CryptedScheme.GetType<DatabaseScheme> {
        return this.snapshot.val() as DatabaseScheme;
    }

    public hasChild(path: string): boolean {
        return this.snapshot.hasChild(path.replaceAll('/', '_'));
    }

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    public forEach(action: (snapshot: IDatabaseSnapshot<ObjectValue<DatabaseScheme>>) => boolean | void): boolean {
        return this.snapshot.forEach(snapshot => action(new DatabaseSnapshot<ObjectValue<DatabaseScheme>>(snapshot)));
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
