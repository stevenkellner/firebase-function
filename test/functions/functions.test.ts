import * as dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { connectFunctionsEmulator, type Functions, getFunctions, httpsCallable } from 'firebase/functions';
import { HexBytesCoder, HMAC, Result, Utf8BytesCoder } from '../../src';
import { expect } from '../../testSrc';

describe('functions', () => {

    // eslint-disable-next-line @typescript-eslint/init-declarations
    let functions: Functions;

    before(() => {
        dotenv.config({ path: 'test/.env.test' });
        const app = initializeApp({
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            databaseURL: process.env.FIREBASE_DATABASE_URL,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID
        });
        functions = getFunctions(app, 'europe-west1');
        connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    });

    function createMacTag(parameters: unknown, key: Uint8Array): string {
        const messageAuthenticater = new HMAC(key);
        const parametersBytesCoder = new Utf8BytesCoder();
        const encodedParameters = parametersBytesCoder.encode(JSON.stringify(parameters));
        const rawTag = messageAuthenticater.sign(encodedParameters);
        const macTagByteCoder = new HexBytesCoder();
        return macTagByteCoder.decode(rawTag);
    }

    it('call a firebase function', async () => {
        const function1 = httpsCallable(functions, 'function1');
        const parameters = {
            v1: 'c',
            v2: [0, 1, 2],
            v3: true
        };
        const result = Result.from((await function1({
            macTag: createMacTag(parameters, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])),
            parameters: parameters
        })).data);
        expect(result).to.be.deep.equal(Result.success({
            v1: 'a c flattened',
            v2: 13
        }));
    });

    it('mac tag not verified', async () => {
        const function1 = httpsCallable(functions, 'function1');
        const parameters = {
            v1: 'c',
            v2: [0, 1, 2],
            v3: true
        };
        const result = Result.from((await function1({
            macTag: '00ff',
            parameters: parameters
        })).data);
        expect(result.state).to.be.equal('failure');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect((result.error as any).code).to.be.equal('permission-denied');
    });
});
