import type { CryptedScheme, IDatabaseScheme, ValidDatabaseSchemeType } from '../src/database/IDatabaseScheme';
import type { IDatabaseReference } from '../src/database/IDatabaseReference';
import type { IDatabaseSnapshot } from '../src/database/IDatabaseSnapshot';
import { MockDatabaseSnapshot } from './MockDatabaseSnapshot';

class ParentMockDatabaseRefernence<ParentDatabaseScheme extends Record<string, IDatabaseScheme>, ChildKey extends keyof ParentDatabaseScheme & string> implements IDatabaseReference<ParentDatabaseScheme[ChildKey]> {
    public constructor(
        private readonly parentData: ParentDatabaseScheme | null,
        private readonly childKey: ChildKey
    ) {}

    public async snapshot(): Promise<IDatabaseSnapshot<ParentDatabaseScheme[ChildKey]>> {
        return Promise.resolve(new MockDatabaseSnapshot(this.childKey, this.parentData !== null && this.childKey in this.parentData ? this.parentData[this.childKey] : null));
    }

    public child<Key extends true extends CryptedScheme.IsCrypted<ParentDatabaseScheme[ChildKey]> ? never : keyof ParentDatabaseScheme[ChildKey] & string>(key: Key): IDatabaseReference<ParentDatabaseScheme[ChildKey] extends Record<string, IDatabaseScheme> ? ParentDatabaseScheme[ChildKey][Key] : never> {
        return new ParentMockDatabaseRefernence(this.parentData !== null && this.childKey in this.parentData && typeof this.parentData[this.childKey] === 'object' ? this.parentData[this.childKey] as any : null, key);
    }

    public async set(value: CryptedScheme.GetType<ParentDatabaseScheme[ChildKey]>, crypted: 'encrypt'): Promise<void>;
    public async set(value: true extends CryptedScheme.IsCrypted<ParentDatabaseScheme[ChildKey]> ? never : ParentDatabaseScheme[ChildKey]): Promise<void>;
    // eslint-disable-next-line @typescript-eslint/require-await
    public async set(value: ParentDatabaseScheme[ChildKey] | CryptedScheme.GetType<ParentDatabaseScheme[ChildKey]>, crypted: 'plain' | 'encrypt' = 'plain'): Promise<void> {
        if (this.parentData === null)
            return;
        if (crypted === 'encrypt') {
            this.parentData[this.childKey] = {
                value: value,
                crypted: true
            } as ParentDatabaseScheme[ChildKey];
        } else
            this.parentData[this.childKey] = value as ParentDatabaseScheme[ChildKey];
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async remove(): Promise<void> {
        if (this.parentData !== null && this.childKey in this.parentData)
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.parentData[this.childKey];
    }
}

export class MockDatabaseReference<DatabaseScheme extends IDatabaseScheme> implements IDatabaseReference<DatabaseScheme> {
    public constructor(
        private data: DatabaseScheme | null,
        public readonly key: string | null = null
    ) {}

    public async snapshot(): Promise<IDatabaseSnapshot<DatabaseScheme>> {
        return Promise.resolve(new MockDatabaseSnapshot(this.key, this.data));
    }

    public child<Key extends true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : keyof DatabaseScheme & string>(key: Key): IDatabaseReference<DatabaseScheme extends Record<string, IDatabaseScheme> ? DatabaseScheme[Key] : never> {
        return new ParentMockDatabaseRefernence(this.data !== null && typeof this.data === 'object' ? this.data as any : null, key);
    }

    public async set(value: CryptedScheme.GetType<DatabaseScheme>, crypted: 'encrypt'): Promise<void>;
    public async set(value: true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : DatabaseScheme): Promise<void>;
    // eslint-disable-next-line @typescript-eslint/require-await
    public async set(value: DatabaseScheme | CryptedScheme.GetType<DatabaseScheme>, crypted: 'plain' | 'encrypt' = 'plain'): Promise<void> {
        if (crypted === 'encrypt') {
            this.data = {
                value: value,
                crypted: true
            } as DatabaseScheme;
        } else
            this.data = value as DatabaseScheme;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async remove(): Promise<void> {
        this.data = null;
    }
}

export namespace MockDatabaseReference {
    export function createDatabaseScheme<DatabaseScheme extends IDatabaseScheme>(create: (encrypt: <T extends ValidDatabaseSchemeType>(value: T) => CryptedScheme<T>) => DatabaseScheme): DatabaseScheme {
        return create(value => ({ value: value, crypted: true }));
    }
}
