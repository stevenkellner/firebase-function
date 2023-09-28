import { onValue, ref, set, remove, type Database } from 'firebase/database';
import { Crypter } from '../crypter';
import { type IDatabaseScheme, type CryptedScheme } from '../database';

export class FirebaseDatabase<DatabaseScheme extends IDatabaseScheme> {
    public constructor(
        private readonly database: Database,
        private readonly cryptionKeys: Crypter.Keys,
        private readonly path?: string
    ) {}

    public child<Key extends true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : (keyof DatabaseScheme & string)>(key: Key): FirebaseDatabase<DatabaseScheme extends Record<string, IDatabaseScheme> ? DatabaseScheme[Key] : never> {
        return new FirebaseDatabase(this.database, this.cryptionKeys, this.path === undefined ? key.replaceAll('/', '_') : `${this.path}/${key.replaceAll('/', '_')}`);
    }

    public async set(value: CryptedScheme.GetType<DatabaseScheme>, crypted: 'encrypt'): Promise<void>;
    public async set(value: true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : DatabaseScheme): Promise<void>;
    public async set(value: DatabaseScheme | CryptedScheme.GetType<DatabaseScheme>, crypted: 'plain' | 'encrypt' = 'plain'): Promise<void> {
        if (crypted === 'encrypt') {
            const crypter = new Crypter(this.cryptionKeys);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value = crypter.encodeEncrypt(value) as any;
        }
        const reference = ref(this.database, this.path);
        await set(reference, value);
    }

    private async value(): Promise<unknown> {
        const reference = ref(this.database, this.path);
        return await new Promise<unknown>(resolve => {
            onValue(reference, snapshot => {
                if (!snapshot.exists())
                    throw new Error('No data in snapshot.');
                resolve(snapshot.val());
            }, {
                onlyOnce: true
            });
        });
    }

    public async get(crypted: 'decrypt'): Promise<true extends CryptedScheme.IsCrypted<DatabaseScheme> ? CryptedScheme.GetType<DatabaseScheme> : never>;
    public async get(): Promise<true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : DatabaseScheme>;
    public async get(crypted: 'plain' | 'decrypt' = 'plain'): Promise<DatabaseScheme | CryptedScheme.GetType<DatabaseScheme>> {
        if (crypted === 'decrypt') {
            const crypter = new Crypter(this.cryptionKeys);
            return crypter.decryptDecode<CryptedScheme.GetType<DatabaseScheme>>(await this.value() as string);
        }
        return await this.value() as DatabaseScheme;
    }

    public async exists(): Promise<boolean> {
        const reference = ref(this.database, this.path);
        return await new Promise<boolean>(resolve => {
            onValue(reference, snapshot => {
                resolve(snapshot.exists());
            }, {
                onlyOnce: true
            });
        });
    }

    public async remove(): Promise<void> {
        const reference = ref(this.database, this.path);
        await remove(reference);
    }
}
