import { Flattable } from './../utils/Flattable';
import type { Firestore } from 'firebase-admin/firestore';
import { FirestoreCollection } from './FirestoreCollection';
import type { FirestorePath } from './FirestorePath';
import { FirestoreSnapshot } from './FirestoreSnapshot';
import type { Flatten } from '../utils';

export class FirestoreDocument<
    Values extends Record<string, any>,
    SubCollections extends Record<string, FirestoreCollection<any>> = never
> {

    public constructor(
        private readonly firestore: Firestore,
        private readonly path: FirestorePath
    ) {}

    public collection<Key extends keyof SubCollections & string>(
        key: Key
    ): SubCollections[Key] {
        return new FirestoreCollection(this.firestore, this.path.appending(key)) as SubCollections[Key];
    }

    public async snapshot(): Promise<FirestoreSnapshot<Values>> {
        const snapshot = await this.firestore.doc(this.path.fullPath).get() as FirebaseFirestore.DocumentSnapshot<Flatten<Values>>;
        return new FirestoreSnapshot(snapshot);
    }

    public async set(values: Values): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.firestore.doc(this.path.fullPath).set(Flattable.flatten(values) as any);
    }

    public async remove(): Promise<void> {
        await this.firestore.doc(this.path.fullPath).delete();
    }
}

export namespace FirestoreDocument {

    export type ValuesOf<Document extends FirestoreDocument<any, any>> = Document extends FirestoreDocument<infer Values, any> ? Values : never;

    export type SubCollectionsOf<Document extends FirestoreDocument<any, any>> = Document extends FirestoreDocument<any, infer SubCollections> ? SubCollections : never;
}
