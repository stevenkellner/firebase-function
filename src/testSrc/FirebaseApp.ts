import type { FirestoreDocument } from './../firestore/FirestoreDocument';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import type { FirebaseFunctions } from '../firebase';
import { FirebaseFunctionsCaller } from './FirebaseFunctionsCaller';
import type { FirebaseApp as FirebaseAppInstance } from 'firebase/app';
import { FirebaseAuthenticator } from './FirebaseAuthenticator';
import { FirebaseFirestoreDocument } from './FirebaseFirestore';
import { FirestorePath } from '../firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

export class FirebaseApp<
    Functions extends FirebaseFunctions,
    FirestoreScheme extends FirestoreDocument<any, any>
> {

    private functionsEmulatorConnected = false;

    private authEmulatorConnected = false;

    private firestoreEmulatorConnected = false;

    public constructor(
        private readonly options: FirebaseApp.Options
    ) {}

    public get functions(): FirebaseFunctionsCaller<Functions> {
        const functionsInstance = getFunctions(this.options.app, this.options.region);
        if (!this.functionsEmulatorConnected && this.options.useFunctionsEmulatorPort !== null) {
            connectFunctionsEmulator(functionsInstance, '127.0.0.1', this.options.useFunctionsEmulatorPort);
            this.functionsEmulatorConnected = true;
        }
        return new FirebaseFunctionsCaller(this.options, functionsInstance);
    }

    public get auth(): FirebaseAuthenticator {
        const authInstance = getAuth(this.options.app);
        if (!this.authEmulatorConnected && this.options.useAuthEmulatorPort !== null) {
            connectAuthEmulator(authInstance, `http://127.0.0.1:${this.options.useAuthEmulatorPort}`);
            this.authEmulatorConnected = true;
        }
        return new FirebaseAuthenticator(this.options, authInstance);
    }

    public get firestore(): FirebaseFirestoreDocument<FirestoreScheme> {
        const firestoreInstance = getFirestore(this.options.app);
        if (!this.firestoreEmulatorConnected && this.options.useFirestoreEmulatorPort !== null) {
            connectFirestoreEmulator(firestoreInstance, '127.0.0.1', this.options.useFirestoreEmulatorPort);
            this.firestoreEmulatorConnected = true;
        }
        return new FirebaseFirestoreDocument(this.options, new FirestorePath(), firestoreInstance);
    }
}

export namespace FirebaseApp {
    export interface Options {
        macKey: Uint8Array;
        app: FirebaseAppInstance;
        region: SupportedRegion;
        useFunctionsEmulatorPort: number | null;
        requestBaseUrl: string;
        useAuthEmulatorPort: number | null;
        useFirestoreEmulatorPort: number | null;
    }
}
