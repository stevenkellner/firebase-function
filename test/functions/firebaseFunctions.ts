import { initializeApp } from 'firebase/app';
import { configDotenv } from 'dotenv';
import { firebaseFunctionsContext } from '../../example/functions/src/firebaseFunctionsContext';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { createCallableClientFirebaseFunctions } from '../../src';

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
const functions = getFunctions(undefined, 'europe-west1');
connectFunctionsEmulator(functions, '127.0.0.1', 5001);

export function createFirebaseFunctions(macKey: Uint8Array): ReturnType<typeof createCallableClientFirebaseFunctions<typeof firebaseFunctionsContext>> {
    return createCallableClientFirebaseFunctions(firebaseFunctionsContext, functions, `http://127.0.0.1:5001/${process.env.FIREBASE_PROJECT_ID}`, 'europe-west1', macKey);
}
