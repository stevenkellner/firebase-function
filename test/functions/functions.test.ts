import { expect } from '@assertive-ts/core';
import { BytesCoder, HMAC, Result } from '@stevenkellner/typescript-common-functionality';
import { configDotenv } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator, type Functions, httpsCallable } from 'firebase/functions';

describe('Functions', () => {

    let functions: Functions;

    const macKey = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);

    before(() => {
        configDotenv({ path: 'test/.env.test' });
        initializeApp({
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            databaseURL: process.env.FIREBASE_DATABASE_URL,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID
        });
        functions = getFunctions(undefined, 'europe-west1');
        connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    });

    function createMacTag(parameters: unknown, key: Uint8Array): string {
        const messageAuthenticater = new HMAC(key);
        const jsonString = parameters === undefined ? '' : JSON.stringify(parameters);
        const encodedParameters = BytesCoder.fromUtf8(jsonString);
        const tagBytes = messageAuthenticater.sign(encodedParameters);
        return BytesCoder.toHex(tagBytes);
    }

    it('should return the correct response', async () => {
        const parameters = {
            v1: 'value1',
            v2: [1, 2, 3],
            v3: true
        };
        const function1 = httpsCallable(functions, 'function1');
        const result = Result.from((await function1({
            macTag: createMacTag(parameters, macKey),
            parameters: parameters
        })).data);
        expect(result).toBeEqual(Result.success({
            v1: 'a value1 flattened',
            v2: 16
        }));
    });

    it('should return an error as the tag is incorrect', async () => {
        const parameters = {
            v1: 'value1',
            v2: [1, 2, 3],
            v3: true
        };
        const function1 = httpsCallable(functions, 'function1');
        const result = Result.from((await function1({
            macTag: createMacTag(parameters, new Uint8Array([])),
            parameters: parameters
        })).data);
        expect(result).toBeEqual(Result.failure({
            name: 'FunctionsError',
            code: 'failed-precondition',
            message: 'Invalid MAC tag',
            details: null
        }));
    });
});
