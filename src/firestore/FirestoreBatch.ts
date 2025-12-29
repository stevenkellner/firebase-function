import type { Firestore } from 'firebase-admin/firestore';
import type { FirestoreCollection } from './FirestoreCollection';
import type { FirestoreDocument } from './FirestoreDocument';
import { Flattable } from '@stevenkellner/typescript-common-functionality';

export class FirestoreBatch {

    private readonly batch: FirebaseFirestore.WriteBatch;

    public constructor(
        private readonly firestore: Firestore
    ) {
        this.batch = firestore.batch();
    }

    public set<
        Values extends Record<string, any>,
        SubCollections extends Record<string, FirestoreCollection<any>>
    >(document: FirestoreDocument<Values, SubCollections>, values: Values): void {
        this.batch.set(this.firestore.doc(document.fullPath), Flattable.flatten(values) as any);
    }

    public remove<
        Values extends Record<string, any>,
        SubCollections extends Record<string, FirestoreCollection<any>>
    >(document: FirestoreDocument<Values, SubCollections>): void {
        this.batch.delete(this.firestore.doc(document.fullPath));
    }

    public async commit(): Promise<void> {
        await this.batch.commit();
    }
}
