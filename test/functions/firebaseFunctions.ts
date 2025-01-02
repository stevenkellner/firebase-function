import { initializeApp } from 'firebase/app';
import { configDotenv } from 'dotenv';
import { firebaseFunctionCreators } from '../../example/functions/src/firebaseFunctionCreators';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { createClientFirebaseFunctions } from '../../src';

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

export function createFirebaseFunctions(macKey: Uint8Array): ReturnType<typeof createClientFirebaseFunctions<typeof firebaseFunctionCreators>> {
    return createClientFirebaseFunctions(firebaseFunctionCreators, functions, `http://127.0.0.1:5001/${process.env.FIREBASE_PROJECT_ID}`, 'europe-west1', macKey);
}
