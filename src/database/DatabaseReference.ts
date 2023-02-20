import * as admin from 'firebase-admin';
import { DatabaseSnapshot } from './DatabaseSnapshot';
import { type ValidSchemeType } from './ValidSchemeType';

export class DatabaseReference<Scheme extends ValidSchemeType> {
    public constructor(
        private readonly reference: admin.database.Reference
    ) {}

    public async snapshot(): Promise<DatabaseSnapshot<Scheme>> {
        return new DatabaseSnapshot<Scheme>(await this.reference.once('value'));
    }

    public child<Key extends keyof Scheme & string>(key: Key): DatabaseReference<Scheme extends Record<string, ValidSchemeType> ? Scheme[Key] : never> {
        return new DatabaseReference(this.reference.child(key));
    }

    public async set(value: Scheme, onComplete?: (a: Error | null) => void) {
        await this.reference.set(value, onComplete);
    }

    public async remove(onComplete?: (a: Error | null) => void) {
        await this.reference.remove(onComplete);
    }
}

export namespace DatabaseReference {
    export function base<Scheme extends ValidSchemeType>(databaseUrl?: string): DatabaseReference<Scheme> {
        const reference = admin.app().database(databaseUrl).ref();
        return new DatabaseReference(reference);
    }
}
