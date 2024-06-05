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

    public async addDocument<Key extends keyof Documents & string>(
        key: Key,
        documentValues: FirestoreDocument.ValuesOf<Documents[Key]>
    ): Promise<void> {
        await this.firestore.collection(this.path.fullPath).doc(key).set(documentValues);
    }

    public getDocument<Key extends keyof Documents & string>(
        key: Key
    ): Documents[Key] {
        return new FirestoreDocument(this.firestore, this.path.appending(key)) as Documents[Key];
    }

    public async removeDocument<Key extends keyof Documents & string>(
        key: Key
    ): Promise<void> {
        await this.firestore.doc(this.path.appending(key).fullPath).delete();
    }
}

export namespace FirestoreCollection {

    export type DocumentsOf<Collection extends FirestoreCollection<any>> = Collection extends FirestoreCollection<infer Documents> ? Documents : never;
}
