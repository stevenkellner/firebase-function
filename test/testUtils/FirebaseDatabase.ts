import type { CryptedScheme, IDatabaseScheme } from '../../src/database';
import { type Database, onValue, ref, remove, set } from 'firebase/database';

export class FirebaseDatabase<DatabaseScheme extends IDatabaseScheme> {
    public constructor(
        private readonly database: Database,
        private readonly path: string | null = null
    ) {}

    public child<Key extends true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : (keyof DatabaseScheme & string)>(key: Key): FirebaseDatabase<DatabaseScheme extends Record<string, IDatabaseScheme> ? DatabaseScheme[Key] : never> {
        return new FirebaseDatabase(this.database, this.path === null ? key.replaceAll('/', '_') : `${this.path}/${key.replaceAll('/', '_')}`);
    }

    public async set(value: CryptedScheme.GetType<DatabaseScheme>, crypted: 'encrypt'): Promise<void>;
    public async set(value: true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : DatabaseScheme): Promise<void>;
    public async set(value: DatabaseScheme | CryptedScheme.GetType<DatabaseScheme>): Promise<void> {
        // eslint-disable-next-line no-undefined
        const reference = ref(this.database, this.path ?? undefined);
        await set(reference, value);
    }

    public async get(crypted: 'decrypt'): Promise<true extends CryptedScheme.IsCrypted<DatabaseScheme> ? CryptedScheme.GetType<DatabaseScheme> : never>;
    public async get(): Promise<true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : DatabaseScheme>;
    public async get(): Promise<DatabaseScheme | CryptedScheme.GetType<DatabaseScheme>> {
        return await this.value() as DatabaseScheme;
    }

    public async exists(): Promise<boolean> {
        // eslint-disable-next-line no-undefined
        const reference = ref(this.database, this.path ?? undefined);
        return new Promise<boolean>(resolve => {
            onValue(reference, snapshot => {
                resolve(snapshot.exists());
            }, {
                onlyOnce: true
            });
        });
    }

    public async remove(): Promise<void> {
        // eslint-disable-next-line no-undefined
        const reference = ref(this.database, this.path ?? undefined);
        await remove(reference);
    }

    private async value(): Promise<unknown> {
        // eslint-disable-next-line no-undefined
        const reference = ref(this.database, this.path ?? undefined);
        return new Promise<unknown>(resolve => {
            onValue(reference, snapshot => {
                if (!snapshot.exists())
                    throw new Error('No data in snapshot.');
                resolve(snapshot.val());
            }, {
                onlyOnce: true
            });
        });
    }
}
