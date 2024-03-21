import type * as admin from 'firebase-admin';
import type { IDatabaseScheme } from './IDatabaseScheme';
import type { IDatabaseReference } from './IDatabaseReference';
import type { IDatabaseSnapshot } from './IDatabaseSnapshot';
import { DatabaseSnapshot } from './DatabaseSnapshot';
import type { ICrypter } from '../crypter';
import { Base64BytesCoder, Utf8BytesCoder } from '../bytesCoder';

export class DatabaseReference<Scheme extends IDatabaseScheme> implements IDatabaseReference<Scheme> {

    private static readonly utf8BytesCoder = new Utf8BytesCoder();

    private static readonly base64BytesCoder = new Base64BytesCoder();

    public constructor(
        private readonly reference: admin.database.Reference,
        private readonly crypter: ICrypter
    ) {}

    public async snapshot(): Promise<IDatabaseSnapshot<Scheme>> {
        return new DatabaseSnapshot(await this.reference.once('value'), this.crypter);
    }

    public child<Key extends IDatabaseScheme.Key<Scheme>>(key: Key & string): IDatabaseReference<IDatabaseScheme.Child<Scheme, Key>> {
        return new DatabaseReference(this.reference.child(key.replaceAll('/', '_')), this.crypter);
    }

    public async set(value: IDatabaseScheme.UncryptedValue<Scheme>): Promise<void> {
        return new Promise((resolve, reject) => {
            void this.reference.set(value, error => {
                error === null ? resolve() : reject(error);
            });
        });
    }

    public async setCrypted(value: IDatabaseScheme.CryptedValue<Scheme>): Promise<void> {
        const jsonValue = JSON.stringify(value);
        const encodedValue = DatabaseReference.utf8BytesCoder.encode(jsonValue);
        const cryptedValue = this.crypter.encrypt(encodedValue);
        const decodedCryptedValue = DatabaseReference.base64BytesCoder.decode(cryptedValue);
        return new Promise((resolve, reject) => {
            void this.reference.set(decodedCryptedValue, error => {
                error === null ? resolve() : reject(error);
            });
        });
    }

    public async remove(): Promise<void> {
        return new Promise((resolve, reject) => {
            void this.reference.remove(error => {
                error === null ? resolve() : reject(error);
            });
        });
    }
}
