import * as admin from 'firebase-admin';
import { FirestoreDocument } from './../firestore/FirestoreDocument';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import type { FirebaseFunctions } from '../firebase';
import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { FirestorePath } from '../firestore';
import { type Functions as FunctionsInstance, connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { type Auth as AuthInstance, connectAuthEmulator, getAuth } from 'firebase/auth';
import { FirebaseAuthenticator } from './FirebaseAuthenticator';
import { FirebaseFunctionsCaller } from './FirebaseFunctionsCaller';

export class FirebaseApp<
    Functions extends FirebaseFunctions,
    FirestoreScheme extends FirestoreDocument<any, any>
> {

    private readonly functionsInstance: FunctionsInstance;

    private readonly authInstance: AuthInstance;

    public constructor(
        private readonly options: FirebaseApp.Options
    ) {
        process.env.FIRESTORE_EMULATOR_HOST = `localhost:${options.emulatorPorts.firestore}`;
        admin.initializeApp({
            credential: admin.credential.cert(options.firebaseOptions)
        });
        const app = initializeApp(options.firebaseOptions);
        this.functionsInstance = getFunctions(app, this.options.region);
        connectFunctionsEmulator(this.functionsInstance, '127.0.0.1', this.options.emulatorPorts.functions);
        this.authInstance = getAuth(app);
        connectAuthEmulator(this.authInstance, `http://127.0.0.1:${this.options.emulatorPorts.auth}`);
    }

    public get functions(): FirebaseFunctionsCaller<Functions> {
        return new FirebaseFunctionsCaller(this.options, this.functionsInstance);
    }

    public get auth(): FirebaseAuthenticator {
        return new FirebaseAuthenticator(this.options, this.authInstance);
    }

    public get firestore(): FirestoreScheme {
        return new FirestoreDocument(admin.app().firestore(), new FirestorePath()) as FirestoreScheme;
    }
}

export namespace FirebaseApp {
    export interface Options {
        macKey: Uint8Array;
        firebaseOptions: FirebaseOptions & admin.ServiceAccount;
        region: SupportedRegion;
        emulatorPorts: {
            functions: number;
            auth: number;
            firestore: number;
        };
    }
}
