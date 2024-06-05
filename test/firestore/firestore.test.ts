import { FirestoreCollection, type FirestoreDocument, FirestorePath } from '../../src';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { expect } from '../../testSrc';

export type FirestoreScheme = FirestoreCollection<{
    asdf: FirestoreDocument<{
        asf: string;
    }, {
        pipo: FirestoreCollection<{
            piou: FirestoreDocument<{
                njd: boolean;
            }>;
        }>;
    }>;
    vwts: FirestoreDocument<never, {
        opi: FirestoreCollection<{
            oij: FirestoreDocument<Record<string, {
                abc: string;
                def: number;
            }>>;
        }>;
    }>;
    ouja: FirestoreDocument<{
        v1: string;
        v2: number;
        v3: boolean;
        v4: null;
        v5: Uint8Array;
        v6: {
            v7: string[];
        };
        v8: [boolean, { v9: number }, null];
    }>;
}>;

describe('Firestore', () => {

    // eslint-disable-next-line @typescript-eslint/init-declarations
    let baseCollection: FirestoreScheme;

    before(() => {
        dotenv.config({ path: 'test/.env.test' });
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        baseCollection = new FirestoreCollection(admin.app().firestore(), new FirestorePath('test'));
    });

    afterEach(async () => {
        const allDocs = await admin.app().firestore().collection('test').listDocuments();
        await Promise.all(allDocs.map(async doc => doc.delete()));
    });

    async function addDocument(): Promise<FirestoreDocument.ValuesOf<FirestoreCollection.DocumentsOf<FirestoreScheme>['ouja']>> {
        const data: FirestoreDocument.ValuesOf<FirestoreCollection.DocumentsOf<FirestoreScheme>['ouja']> = {
            v1: 'string',
            v2: 1,
            v3: true,
            v4: null,
            v5: new Uint8Array([1, 2, 3]),
            v6: {
                v7: ['a', 'b', 'c']
            },
            v8: [true, { v9: 2 }, null]
        };
        await baseCollection.addDocument('ouja', data);
        return data;
    }

    it('add a document', async () => {
        const data = await addDocument();
        expect(await baseCollection.getDocument('ouja').getValues()).to.be.deep.equal(data);
    });

    it('remove a document', async () => {
        await addDocument();
        await baseCollection.removeDocument('ouja');
        await expect(async () => baseCollection.getDocument('ouja').getValues()).to.awaitThrow();
    });

    it('update documnent values', async () => {
        const data = await addDocument();
        const newData: Partial<FirestoreDocument.ValuesOf<FirestoreCollection.DocumentsOf<FirestoreScheme>['ouja']>> = {
            v1: 'string2',
            v2: 2,
            v3: false
        };
        await baseCollection.getDocument('ouja').setValues(newData);
        expect(await baseCollection.getDocument('ouja').getValues()).to.be.deep.equal({
            ...data,
            ...newData
        });
    });

    it('add document to subcollection', async () => {
        await baseCollection.getDocument('asdf').getSubCollection('pipo').addDocument('piou', { njd: true });
        expect(await baseCollection.getDocument('asdf').getSubCollection('pipo').getDocument('piou').getValues()).to.be.deep.equal({ njd: true });
    });
});
