import type * as admin from 'firebase-admin';
import { Crypter } from '../crypter';
import { type ObjectValue } from '../utils';
import { type GetCryptedScheme, type IsCryptedScheme, type SchemeType } from './SchemeType';

export class DatabaseSnapshot<Scheme extends SchemeType> {
    public constructor(
        private readonly snapshot: admin.database.DataSnapshot,
        private readonly cryptionKeys: Crypter.Keys
    ) {}

    public child<Key extends true extends IsCryptedScheme<Scheme> ? never : (keyof Scheme & string)>(key: Key): DatabaseSnapshot<Scheme extends Record<string, SchemeType> ? Scheme[Key] : never> {
        return new DatabaseSnapshot(this.snapshot.child(key.replaceAll('/', '_')), this.cryptionKeys);
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
        return this.snapshot.hasChild(path.replaceAll('/', '_'));
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

    public forEach(action: (snapshot: DatabaseSnapshot<ObjectValue<Scheme>>) => boolean | void): boolean {
        return this.snapshot.forEach(snapshot => {
            return action(new DatabaseSnapshot<ObjectValue<Scheme>>(snapshot, this.cryptionKeys));
        });
    }

    public map<U>(transform: (snapshot: DatabaseSnapshot<ObjectValue<Scheme>>) => U): U[] {
        const result: U[] = [];
        this.forEach(snapshot => {
            result.push(transform(snapshot));
        });
        return result;
    }

    public flatMap<U>(transform: (snapshot: DatabaseSnapshot<ObjectValue<Scheme>>) => U[]): U[] {
        const result: U[] = [];
        this.forEach(snapshot => {
            for (const value of transform(snapshot))
                result.push(value);
        });
        return result;
    }

    public compactMap<U>(transform: (snapshot: DatabaseSnapshot<ObjectValue<Scheme>>) => U | undefined | null): U[] {
        const result: U[] = [];
        this.forEach(snapshot => {
            const value = transform(snapshot);
            if (value !== undefined && value !== null)
                result.push(value);
        });
        return result;
    }

    public reduce<T>(initialValue: T, transform: (value: T, snapshot: DatabaseSnapshot<ObjectValue<Scheme>>) => T): T {
        this.forEach(snapshot => {
            initialValue = transform(initialValue, snapshot);
        });
        return initialValue;
    }
}
