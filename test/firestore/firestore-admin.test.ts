import { expect } from '@assertive-ts/core';
import { type FirestoreCollection, FirestoreDocument } from '../../src/admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { configDotenv } from 'dotenv';
import { getFirestore } from 'firebase-admin/firestore';
import { Sha512, BytesCoder } from '@stevenkellner/typescript-common-functionality';

export type FirestoreScheme = FirestoreDocument<never, {
    baseCollection: FirestoreCollection<{
        doc1: FirestoreDocument<{ asf: string }, {
            col1: FirestoreCollection<{
                doc2: FirestoreDocument<{
                    v10: boolean;
                }>;
            }>;
        }>;
        doc3: FirestoreDocument<never, {
            col2: FirestoreCollection<{
                doc4: FirestoreDocument<Record<string, {
                    abc: string;
                    def: number;
                }>>;
            }>;
        }>;
        doc4: FirestoreDocument<{
            v1: string;
            v2: number;
            v3: boolean;
            v4: null;
            v5: Uint8Array;
            v6: { v7: string[] };
            v8: [boolean, { v9: number }, null];
        }>;
    }>;
}>;

type Doc4Values = FirestoreDocument.ValuesOf<FirestoreCollection.DocumentsOf<FirestoreDocument.SubCollectionsOf<FirestoreScheme>['baseCollection']>['doc4']>;

/* eslint-disable @stylistic/newline-per-chained-call */
describe('Firestore admin', () => {

    let baseDocument: FirestoreScheme;

    before(() => {
        configDotenv({ path: 'test/.env.test' });
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
        baseDocument = FirestoreDocument.base(getFirestore());
        if (process.env.FIREBASE_PRIVATE_KEY === undefined)
            throw new Error('FIREBASE_PRIVATE_KEY is not set');
        console.log(BytesCoder.toHex(new Sha512().hash(BytesCoder.fromUtf8(process.env.FIREBASE_PRIVATE_KEY))));
    });

    afterEach(async () => {
        await baseDocument.collection('baseCollection').remove();
    });

    async function addDocument(): Promise<Doc4Values> {
        const data: Doc4Values = {
            v1: 'string',
            v2: 1,
            v3: true,
            v4: null,
            v5: new Uint8Array([1, 2, 3]),
            v6: { v7: ['a', 'b', 'c'] },
            v8: [true, { v9: 2 }, null]
        };
        await baseDocument.collection('baseCollection').document('doc4').set(data);
        return data;
    }

    it('should add a document', async () => {
        const data = await addDocument();
        const snapshot = await baseDocument.collection('baseCollection').document('doc4').snapshot();
        expect(snapshot.exists).toBeEqual(true);
        expect({
            ...snapshot.data,
            v5: snapshot.data.v5.buffer
        }).toBeEqual({
            ...data,
            v5: data.v5.buffer
        });
    });

    it('should remove a document', async () => {
        await addDocument();
        await baseDocument.collection('baseCollection').document('doc4').remove();
        const snapshot = await baseDocument.collection('baseCollection').document('doc4').snapshot();
        expect(snapshot.exists).toBeEqual(false);
    });

    it('should update document values', async () => {
        await addDocument();
        const newData: Doc4Values = {
            v1: 'string2',
            v2: 2,
            v3: false,
            v4: null,
            v5: new Uint8Array([4, 5, 6, 7]),
            v6: { v7: ['d', 'e'] },
            v8: [false, { v9: 0 }, null]
        };
        await baseDocument.collection('baseCollection').document('doc4').set(newData);
        const snapshot = await baseDocument.collection('baseCollection').document('doc4').snapshot();
        expect(snapshot.exists).toBeEqual(true);
        expect({
            ...snapshot.data,
            v5: snapshot.data.v5.buffer
        }).toBeEqual({
            ...newData,
            v5: newData.v5.buffer
        });
    });

    it('should add document to subcollection', async () => {
        await baseDocument.collection('baseCollection').document('doc1').collection('col1').document('doc2').set({ v10: true });
        const snapshot = await baseDocument.collection('baseCollection').document('doc1').collection('col1').document('doc2').snapshot();
        expect(snapshot.data).toBeEqual({ v10: true });
    });

    it('should retrieve nested document', async () => {
        await baseDocument.collection('baseCollection').document('doc1').collection('col1').document('doc2').set({ v10: true });
        const snapshot = await baseDocument.collection('baseCollection').document('doc1').collection('col1').document('doc2').snapshot();
        expect(snapshot.data).toBeEqual({ v10: true });
    });

    it('should remove collection', async () => {
        await addDocument();
        await baseDocument.collection('baseCollection').remove();
        const snapshot = await baseDocument.collection('baseCollection').document('doc4').snapshot();
        expect(snapshot.exists).toBeEqual(false);
    });
});
