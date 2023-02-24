import * as admin from 'firebase-admin';
import { Crypter } from '../crypter';
import { DatabaseSnapshot } from './DatabaseSnapshot';
import { type IsCryptedScheme, type SchemeType, type GetCryptedScheme } from './SchemeType';

export class DatabaseReference<Scheme extends SchemeType> {
    public constructor(
        private readonly reference: admin.database.Reference,
        private readonly cryptionKeys: Crypter.Keys
    ) {}

    public async snapshot(): Promise<DatabaseSnapshot<Scheme>> {
        return new DatabaseSnapshot<Scheme>(await this.reference.once('value'), this.cryptionKeys);
    }

    public child<Key extends true extends IsCryptedScheme<Scheme> ? never : (keyof Scheme & string)>(key: Key): DatabaseReference<Scheme extends Record<string, SchemeType> ? Scheme[Key] : never> {
        return new DatabaseReference(this.reference.child(key), this.cryptionKeys);
    }

    public async set(value: GetCryptedScheme<Scheme>, crypted: true): Promise<void>;
    public async set(value: true extends IsCryptedScheme<Scheme> ? never : Scheme): Promise<void>;
    public async set(value: Scheme | GetCryptedScheme<Scheme>, crypted: boolean = false): Promise<void> {
        if (crypted) {
            const crypter = new Crypter(this.cryptionKeys);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value = crypter.encodeEncrypt(value) as any;
        }
        return await new Promise<void>((resolve, reject) => {
            this.reference.set(value, error => {
                if (error !== null)
                    return reject(error);
                resolve();
            }).catch(reject);
        });
    }

    public async remove(): Promise<void> {
        return await new Promise<void>((resolve, reject) => {
            this.reference.remove(error => {
                if (error !== null)
                    return reject(error);
                resolve();
            }).catch(reject);
        });
    }
}

export namespace DatabaseReference {
    export function base<Scheme extends SchemeType>(databaseUrl: string | undefined, cryptionKeys: Crypter.Keys): DatabaseReference<Scheme> {
        const reference = admin.app().database(databaseUrl).ref();
        return new DatabaseReference(reference, cryptionKeys);
    }
}
