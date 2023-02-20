import type * as admin from 'firebase-admin';
import { type ValidSchemeType } from './ValidSchemeType';

export class DatabaseSnapshot<Scheme extends ValidSchemeType> {
    public constructor(
        private readonly snapshot: admin.database.DataSnapshot
    ) {}

    public get value(): Scheme {
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

    public forEach(action: (a: DatabaseSnapshot<Scheme extends Array<infer Element> ? Element : never>) => boolean | void): boolean {
        return this.snapshot.forEach(snapshot => {
            return action(new DatabaseSnapshot(snapshot));
        });
    }

    public child<Key extends keyof Scheme & string>(key: Key): DatabaseSnapshot<Scheme extends Record<string, ValidSchemeType> ? Scheme[Key] : never> {
        return new DatabaseSnapshot(this.snapshot.child(key));
    }
}
