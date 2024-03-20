import * as admin from 'firebase-admin';
import type { CryptedScheme, IDatabaseScheme } from './IDatabaseScheme';
import { DatabaseSnapshot } from './DatabaseSnapshot';
import type { IDatabaseReference } from './IDatabaseReference';
import type { PrivateKeys } from '../types/PrivateKeys';

export class DatabaseReference<DatabaseScheme extends IDatabaseScheme> implements IDatabaseReference<DatabaseScheme> {
    public constructor(
        private readonly reference: admin.database.Reference
    ) {}

    public async snapshot(): Promise<DatabaseSnapshot<DatabaseScheme>> {
        return new DatabaseSnapshot<DatabaseScheme>(await this.reference.once('value'));
    }

    public child<Key extends true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : (keyof DatabaseScheme & string)>(key: Key): DatabaseReference<DatabaseScheme extends Record<string, IDatabaseScheme> ? DatabaseScheme[Key] : never> {
        return new DatabaseReference(this.reference.child(key.replaceAll('/', '_')));
    }

    public async set(value: CryptedScheme.GetType<DatabaseScheme>, crypted: 'encrypt'): Promise<void>;
    public async set(value: true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : DatabaseScheme): Promise<void>;
    public async set(value: DatabaseScheme | CryptedScheme.GetType<DatabaseScheme>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.reference.set(value, error => {
                if (error !== null) {
                    reject(error);
                    return;
                }
                resolve();
            }).catch(reject);
        });
    }

    public async remove(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.reference.remove(error => {
                if (error !== null) {
                    reject(error);
                    return;
                }
                resolve();
            }).catch(reject);
        });
    }
}

export namespace DatabaseReference {
    export function base<DatabaseScheme extends IDatabaseScheme>(privateKey: PrivateKeys): DatabaseReference<DatabaseScheme> {
        const reference = admin
            .app()
            .database(privateKey.databaseUrl)
            .ref();
        return new DatabaseReference(reference);
    }
}
