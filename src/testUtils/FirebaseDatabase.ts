import { onValue, ref, set, type Database } from 'firebase/database';
import { Crypter } from '../crypter';
import { type GetCryptedScheme, type IsCryptedScheme, type SchemeType } from '../database';

export class FirebaseDatabase<Scheme extends SchemeType> {
    public constructor(
        private readonly database: Database,
        private readonly cryptionKeys: Crypter.Keys,
        private readonly path?: string
    ) {}

    public child<Key extends true extends IsCryptedScheme<Scheme> ? never : (keyof Scheme & string)>(key: Key): FirebaseDatabase<Scheme extends Record<string, SchemeType> ? Scheme[Key] : never> {
        return new FirebaseDatabase(this.database, this.cryptionKeys, this.path === undefined ? key.replaceAll('/', '_') : `${this.path}/${key.replaceAll('/', '_')}`);
    }

    public async set(value: GetCryptedScheme<Scheme>, crypted: 'encrypt'): Promise<void>;
    public async set(value: true extends IsCryptedScheme<Scheme> ? never : Scheme): Promise<void>;
    public async set(value: Scheme | GetCryptedScheme<Scheme>, crypted: 'plain' | 'encrypt' = 'plain'): Promise<void> {
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

    public async get(crypted: 'decrypt'): Promise<true extends IsCryptedScheme<Scheme> ? GetCryptedScheme<Scheme> : never>;
    public async get(): Promise<true extends IsCryptedScheme<Scheme> ? never : Scheme>;
    public async get(crypted: 'plain' | 'decrypt' = 'plain'): Promise<Scheme | GetCryptedScheme<Scheme>> {
        if (crypted === 'decrypt') {
            const crypter = new Crypter(this.cryptionKeys);
            return crypter.decryptDecode<GetCryptedScheme<Scheme>>(await this.value() as string);
        }
        return await this.value() as Scheme;
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
}
