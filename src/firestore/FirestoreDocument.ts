import type { Firestore } from 'firebase-admin/firestore';
import { FirestoreCollection } from './FirestoreCollection';
import type { FirestorePath } from './FirestorePath';

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

    public async getValues(): Promise<Values> {
        const documentSnapshot = await this.firestore.doc(this.path.fullPath).get() as FirebaseFirestore.DocumentSnapshot<Values>;
        if (!documentSnapshot.exists)
            throw new Error('Document does not exist');
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return documentSnapshot.data()!;
    }
}

export namespace FirestoreDocument {

    export type ValuesOf<Document extends FirestoreDocument<any, any>> = Document extends FirestoreDocument<infer Values, any> ? Values : never;
}
