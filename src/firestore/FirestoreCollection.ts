import { FirestoreSnapshot } from './FirestoreSnapshot';
import type { Firestore } from 'firebase-admin/firestore';
import { FirestoreDocument } from './FirestoreDocument';
import type { FirestorePath } from './FirestorePath';
import type { Flattable } from '@stevenkellner/typescript-common-functionality';

export class FirestoreCollection<
    Documents extends Record<string, FirestoreDocument<any, any>>
> {

    public constructor(
        private readonly firestore: Firestore,
        private readonly path: FirestorePath
    ) {}

    public async documentSnapshots(): Promise<FirestoreSnapshot<FirestoreDocument.ValuesOf<Documents[string]>>[]> {
        const collection = this.firestore.collection(this.path.fullPath);
        const documents = await collection.listDocuments();
        return Promise.all(documents.map(async document => {
            const snapshot = await document.get() as FirebaseFirestore.DocumentSnapshot<Flattable.Flatten<FirestoreDocument.ValuesOf<Documents[string]>>>;
            return new FirestoreSnapshot(snapshot);
        }));
    }

    public document<Key extends keyof Documents & string>(key: Key): Documents[Key] {
        return new FirestoreDocument(this.firestore, this.path.appending(key)) as Documents[Key];
    }

    public async remove(): Promise<void> {
        const collection = this.firestore.collection(this.path.fullPath);
        const documents = await collection.listDocuments();
        await Promise.all(documents.map(async document => document.delete()));
    }
}

export namespace FirestoreCollection {

    export type DocumentsOf<Collection extends FirestoreCollection<any>> = Collection extends FirestoreCollection<infer Documents> ? Documents : never;
}
