import type { Firestore } from 'firebase-admin/firestore';
import { FirestoreDocument } from './FirestoreDocument';
import type { FirestorePath } from './FirestorePath';
export class FirestoreCollection<
    Documents extends Record<string, FirestoreDocument<any, any>>
> {

    public constructor(
        private readonly firestore: Firestore,
        private readonly path: FirestorePath
    ) {}

    public document<Key extends keyof Documents & string>(
        key: Key
    ): Documents[Key] {
        return new FirestoreDocument(this.firestore, this.path.appending(key)) as Documents[Key];
    }
}

export namespace FirestoreCollection {

    export type DocumentsOf<Collection extends FirestoreCollection<any>> = Collection extends FirestoreCollection<infer Documents> ? Documents : never;
}
