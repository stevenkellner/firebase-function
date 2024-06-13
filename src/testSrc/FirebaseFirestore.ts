import { type Firestore as FirestoreInstance, setDoc, doc, deleteDoc, getDoc, type DocumentSnapshot } from 'firebase/firestore';
import type { FirestoreCollection, FirestoreDocument, FirestorePath } from '../firestore';
import type { FirebaseApp } from './FirebaseApp';

export class FirebaseFirestoreDocument<FirestoreScheme extends FirestoreDocument<any, any>> {

    public constructor(
        private readonly options: FirebaseApp.Options,
        private readonly path: FirestorePath,
        private readonly firestoreInstance: FirestoreInstance
    ) {}

    public getSubCollection<Key extends keyof FirestoreDocument.SubCollectionsOf<FirestoreScheme> & string>(
        key: Key
    ): FirestoreDocument.SubCollectionsOf<FirestoreScheme>[Key] {
        return new FirebaseFirestoreCollection(this.options, this.path.appending(key), this.firestoreInstance) as FirestoreDocument.SubCollectionsOf<FirestoreScheme>[Key];
    }

    public async setValues(values: FirestoreDocument.ValuesOf<FirestoreScheme>): Promise<void> {
        await setDoc(doc(this.firestoreInstance, this.path.fullPath), values);
    }

    public async snapshot(): Promise<FirebaseFirestoreSnapshot<FirestoreDocument.ValuesOf<FirestoreScheme>>> {
        const snapshot = await getDoc(doc(this.firestoreInstance, this.path.fullPath)) as DocumentSnapshot<FirestoreDocument.ValuesOf<FirestoreScheme>>;
        return new FirebaseFirestoreSnapshot(this.options, snapshot);
    }
}

export class FirebaseFirestoreCollection<FirestoreScheme extends FirestoreCollection<any>> {

    public constructor(
        private readonly options: FirebaseApp.Options,
        private readonly path: FirestorePath,
        private readonly firestoreInstance: FirestoreInstance
    ) {}

    public async addDocument<Key extends keyof FirestoreCollection.DocumentsOf<FirestoreScheme> & string>(
        key: Key,
        documentValues: FirestoreDocument.ValuesOf<FirestoreCollection.DocumentsOf<FirestoreScheme>[Key]>
    ): Promise<void> {
        await setDoc(doc(this.firestoreInstance, this.path.appending(key).fullPath), documentValues);
    }

    public getDocument<Key extends keyof FirestoreCollection.DocumentsOf<FirestoreScheme> & string>(
        key: Key
    ): FirestoreCollection.DocumentsOf<FirestoreScheme>[Key] {
        return new FirebaseFirestoreDocument(this.options, this.path.appending(key), this.firestoreInstance) as FirestoreCollection.DocumentsOf<FirestoreScheme>[Key];
    }

    public async removeDocument<Key extends keyof FirestoreCollection.DocumentsOf<FirestoreScheme> & string>(
        key: Key
    ): Promise<void> {
        await deleteDoc(doc(this.firestoreInstance, this.path.appending(key).fullPath));
    }
}

export class FirebaseFirestoreSnapshot<T> {

    public constructor(
        private readonly options: FirebaseApp.Options,
        private readonly snapshot: DocumentSnapshot<T>
    ) {}

    public get exists(): boolean {
        return this.snapshot.exists();
    }

    public get data(): T {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.snapshot.data()!;
    }
}
