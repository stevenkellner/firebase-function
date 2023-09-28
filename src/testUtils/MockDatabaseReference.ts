import { type IDatabaseReference } from '../database/IDatabaseReference';
import { type ValidDatabaseSchemeType, type CryptedScheme, type IDatabaseScheme } from '../database/IDatabaseScheme';
import { type IDatabaseSnapshot } from '../database/IDatabaseSnapshot';
import { MockDatabaseSnapshot } from './MockDatabaseSnapshot';

export class MockDatabaseReference<DatabaseScheme extends IDatabaseScheme> implements IDatabaseReference<DatabaseScheme> {
    public constructor(
        private data: DatabaseScheme | null,
        public readonly key: string | null = null
    ) {}

    public async snapshot(): Promise<IDatabaseSnapshot<DatabaseScheme>> {
        return new MockDatabaseSnapshot(this.key, this.data);
    }

    public child<Key extends true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : keyof DatabaseScheme & string>(key: Key): IDatabaseReference<DatabaseScheme extends Record<string, IDatabaseScheme> ? DatabaseScheme[Key] : never> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new ParentMockDatabaseRefernence(this.data !== null && typeof this.data === 'object' ? this.data as any : null, key);
    }

    public async set(value: CryptedScheme.GetType<DatabaseScheme>, crypted: 'encrypt'): Promise<void>;
    public async set(value: true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : DatabaseScheme): Promise<void>;
    public async set(value: DatabaseScheme | CryptedScheme.GetType<DatabaseScheme>, crypted: 'plain' | 'encrypt' = 'plain'): Promise<void> {
        if (crypted === 'encrypt') {
            this.data = {
                value: value,
                crypted: true
            } as DatabaseScheme;
        } else {
            this.data = value as DatabaseScheme;
        }
    }

    public async remove(): Promise<void> {
        this.data = null;
    }
}

class ParentMockDatabaseRefernence<ParentDatabaseScheme extends { [key: string]: IDatabaseScheme }, ChildKey extends keyof ParentDatabaseScheme & string> implements IDatabaseReference<ParentDatabaseScheme[ChildKey]> {
    public constructor(
        private readonly parentData: ParentDatabaseScheme | null,
        private readonly childKey: ChildKey
    ) {}

    public async snapshot(): Promise<IDatabaseSnapshot<ParentDatabaseScheme[ChildKey]>> {
        return new MockDatabaseSnapshot(this.childKey, this.parentData !== null && this.childKey in this.parentData ? this.parentData[this.childKey] : null);
    }

    public child<Key extends true extends CryptedScheme.IsCrypted<ParentDatabaseScheme[ChildKey]> ? never : keyof ParentDatabaseScheme[ChildKey] & string>(key: Key): IDatabaseReference<ParentDatabaseScheme[ChildKey] extends Record<string, IDatabaseScheme> ? ParentDatabaseScheme[ChildKey][Key] : never> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new ParentMockDatabaseRefernence(this.parentData !== null && this.childKey in this.parentData && typeof this.parentData[this.childKey] === 'object' ? this.parentData[this.childKey] as any : null, key);
    }

    public async set(value: CryptedScheme.GetType<ParentDatabaseScheme[ChildKey]>, crypted: 'encrypt'): Promise<void>;
    public async set(value: true extends CryptedScheme.IsCrypted<ParentDatabaseScheme[ChildKey]> ? never : ParentDatabaseScheme[ChildKey]): Promise<void>;
    public async set(value: ParentDatabaseScheme[ChildKey] | CryptedScheme.GetType<ParentDatabaseScheme[ChildKey]>, crypted: 'plain' | 'encrypt' = 'plain'): Promise<void> {
        if (this.parentData === null)
            return;
        if (crypted === 'encrypt') {
            this.parentData[this.childKey] = {
                value: value,
                crypted: true
            } as ParentDatabaseScheme[ChildKey];
        } else {
            this.parentData[this.childKey] = value as ParentDatabaseScheme[ChildKey];
        }
    }

    public async remove(): Promise<void> {
        if (this.parentData !== null && this.childKey in this.parentData)
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.parentData[this.childKey];
    }
}

export namespace MockDatabaseReference {
    export function createDatabaseScheme<DatabaseScheme extends IDatabaseScheme>(create: (encrypt: <T extends ValidDatabaseSchemeType>(value: T) => CryptedScheme<T>) => DatabaseScheme): DatabaseScheme {
        return create(value => ({ value: value, crypted: true }));
    }
}
