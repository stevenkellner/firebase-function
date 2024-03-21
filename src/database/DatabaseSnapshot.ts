import type * as admin from 'firebase-admin';
import type { IDatabaseScheme } from './IDatabaseScheme';
import { IDatabaseSnapshot } from './IDatabaseSnapshot';
import type { ICrypter } from '../crypter';
import { Base64BytesCoder, Utf8BytesCoder } from '../bytesCoder';

export class DatabaseSnapshot<Scheme extends IDatabaseScheme> extends IDatabaseSnapshot<Scheme> {

    private static readonly utf8BytesCoder = new Utf8BytesCoder();

    private static readonly base64BytesCoder = new Base64BytesCoder();

    public constructor(
        private readonly snapshot: admin.database.DataSnapshot,
        private readonly crypter: ICrypter
    ) {
        super();
    }

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

    public get value(): IDatabaseScheme.UncryptedValue<Scheme> {
        return this.snapshot.val() as IDatabaseScheme.UncryptedValue<Scheme>;
    }

    public get uncryptedValue(): IDatabaseScheme.CryptedValue<Scheme> {
        const decodedCryptedValue = this.snapshot.val() as string;
        const cryptedValue = DatabaseSnapshot.base64BytesCoder.encode(decodedCryptedValue);
        const encodedValue = this.crypter.decrypt(cryptedValue);
        const jsonValue = DatabaseSnapshot.utf8BytesCoder.decode(encodedValue);
        return JSON.parse(jsonValue) as IDatabaseScheme.CryptedValue<Scheme>;

    }

    public child<Key extends IDatabaseScheme.Key<Scheme>>(key: Key & string): IDatabaseSnapshot<IDatabaseScheme.Child<Scheme, Key>> {
        return new DatabaseSnapshot(this.snapshot.child(key.replaceAll('/', '_')), this.crypter);
    }

    public forEach(action: (snapshot: IDatabaseSnapshot<IDatabaseScheme.Children<Scheme>>) => boolean | void): boolean {
        return this.snapshot.forEach(snapshot => action(new DatabaseSnapshot(snapshot, this.crypter)));
    }
}
