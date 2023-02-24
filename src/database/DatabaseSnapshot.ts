import type * as admin from 'firebase-admin';
import { Crypter } from '../crypter';
import { type GetCryptedScheme, type IsCryptedScheme, type SchemeType } from './SchemeType';

export class DatabaseSnapshot<Scheme extends SchemeType> {
    public constructor(
        private readonly snapshot: admin.database.DataSnapshot,
        private readonly cryptionKeys: Crypter.Keys
    ) {}

    public child<Key extends true extends IsCryptedScheme<Scheme> ? never : (keyof Scheme & string)>(key: Key): DatabaseSnapshot<Scheme extends Record<string, SchemeType> ? Scheme[Key] : never> {
        return new DatabaseSnapshot(this.snapshot.child(key), this.cryptionKeys);
    }

    public value(crypted: true): true extends IsCryptedScheme<Scheme> ? GetCryptedScheme<Scheme> : never;
    public value(): true extends IsCryptedScheme<Scheme> ? never : Scheme;
    public value(crypted: boolean = false): Scheme | GetCryptedScheme<Scheme> {
        if (crypted) {
            const crypter = new Crypter(this.cryptionKeys);
            return crypter.decryptDecode<GetCryptedScheme<Scheme>>(this.snapshot.val());
        }
        return this.snapshot.val();
    }

    public hasChild(path: string): boolean {
        return this.snapshot.hasChild(path);
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
}
