import type { FirebaseFunctions } from '../src';
import { FirebaseFunctionsCaller } from './FirebaseFunctionsCaller';
import type { FirebaseApp as FirebaseAppInstance } from 'firebase/app';

export class FirebaseApp<Functions extends FirebaseFunctions> {

    public constructor(
        private readonly options: FirebaseApp.Options,
        private readonly _functions: Functions
    ) {}

    public get functions(): FirebaseFunctionsCaller<Functions> {
        return new FirebaseFunctionsCaller(this._functions, this.options);
    }
}

export namespace FirebaseApp {
    export interface Options {
        macKey: Uint8Array;
        app: FirebaseAppInstance;
        region: string;
        useEmulator: boolean;
        requestBaseUrl: string;
    }
}
