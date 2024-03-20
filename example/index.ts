import * as admin from 'firebase-admin';
import { FixedLength, type PrivateKeys, createFirebaseFunctions } from '../src';
import type { DatabaseScheme } from './DatabaseScheme';
import { FirebaseApp } from '../testSrc';
import { firebaseFunctions } from './firebaseFunctions';

const privateKeys: PrivateKeys = {
    cryptionKeys: {
        encryptionKey: new FixedLength(Uint8Array.from([]), 32),
        initialisationVector: new FixedLength(Uint8Array.from([]), 16),
        vernamKey: new FixedLength(Uint8Array.from([]), 32)
    },
    callSecretKey: 'abc',
    databaseUrl: 'url/to/my/database'
};

admin.initializeApp();

export = createFirebaseFunctions(() => privateKeys, {}, firebaseFunctions);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function test(): Promise<void> {
    const firebaseApp = new FirebaseApp<typeof firebaseFunctions, DatabaseScheme>({}, privateKeys.cryptionKeys, privateKeys.callSecretKey, {
        functionsRegion: 'europe-west1',
        databaseUrl: privateKeys.databaseUrl
    });
    await firebaseApp.functions.function('person').function('add')
        .call({ id: 'some-guid', name: 'Max Mustermann', age: 25 });
    await firebaseApp.functions.function('person').function('get')
        .request({ id: 'some-guid' });
    await firebaseApp.functions.function('animal').function('get')
        .call({});
}
