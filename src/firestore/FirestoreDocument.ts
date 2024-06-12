import type { Firestore } from 'firebase-admin/firestore';
import { FirestoreCollection } from './FirestoreCollection';
import type { FirestorePath } from './FirestorePath';
import { FirestoreSnapshot } from './FirestoreSnapshot';

type FirestoreValueTypeWithoutArray =
    | boolean
    | Uint8Array
    | string
    | number
    | null
    | { [key: string]: FirestoreValueType };

export type FirestoreValueType =
    | FirestoreValueTypeWithoutArray
    | FirestoreValueTypeWithoutArray[];

export class FirestoreDocument<
    Values extends Record<string, FirestoreValueType>,
    SubCollections extends Record<string, FirestoreCollection<any>> = never
> {

    public constructor(
        private readonly firestore: Firestore,
        private readonly path: FirestorePath
    ) {}

    public getSubCollection<Key extends keyof SubCollections & string>(
        key: Key
    ): SubCollections[Key] {
        return new FirestoreCollection(this.firestore, this.path.appending(key)) as SubCollections[Key];
    }

    public async setValues(values: Partial<Values>): Promise<void> {
        await this.firestore.doc(this.path.fullPath).update(values);
    }

    public async snapshot(): Promise<FirestoreSnapshot<Values>> {
        const snapshot = await this.firestore.doc(this.path.fullPath).get() as FirebaseFirestore.DocumentSnapshot<Values>;
        return new FirestoreSnapshot(snapshot);
    }
}

export namespace FirestoreDocument {

    export type ValuesOf<Document extends FirestoreDocument<any, any>> = Document extends FirestoreDocument<infer Values, any> ? Values : never;

    export type SubCollectionsOf<Document extends FirestoreDocument<any, any>> = Document extends FirestoreDocument<any, infer SubCollections> ? SubCollections : never;
}
