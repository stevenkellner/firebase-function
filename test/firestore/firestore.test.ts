import { FirestoreCollection, type FirestoreDocument, FirestorePath, Flattable } from '../../src';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { expect } from '../../src/testSrc';

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
        await baseCollection.document('ouja').set(data);
        return data;
    }

    it('add a document', async () => {
        const data = await addDocument();
        expect((await baseCollection.document('ouja').snapshot()).data).to.be.deep.equal(Flattable.flatten(data));
    });

    it('remove a document', async () => {
        await addDocument();
        await baseCollection.document('ouja').remove();
        expect((await baseCollection.document('ouja').snapshot()).exists).to.be.equal(false);
    });

    it('update documnent values', async () => {
        await addDocument();
        const newData: FirestoreDocument.ValuesOf<FirestoreCollection.DocumentsOf<FirestoreScheme>['ouja']> = {
            v1: 'string2',
            v2: 2,
            v3: false,
            v4: null,
            v5: new Uint8Array([4, 5, 6, 7]),
            v6: {
                v7: ['d', 'e']
            },
            v8: [false, { v9: 0 }, null]
        };
        await baseCollection.document('ouja').set(newData);
        expect((await baseCollection.document('ouja').snapshot()).data).to.be.deep.equal(Flattable.flatten(newData));
    });

    it('add document to subcollection', async () => {
        await baseCollection.document('asdf').collection('pipo').document('piou').set({ njd: true });
        expect((await baseCollection.document('asdf').collection('pipo').document('piou').snapshot()).data).to.be.deep.equal({ njd: true });
    });
});
