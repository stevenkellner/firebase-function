import { type Crypter } from '../crypter';
import { type FirebaseOptions, initializeApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';
import { getAuth, type Auth } from 'firebase/auth';
import { FirebaseFunctions as FirebaseFunctionsTester } from './FirebaseFunctions';
import { FirebaseDatabase } from './FirebaseDatabase';
import { FirebaseAuth } from './FirebaseAuth';
import { type Functions, getFunctions } from 'firebase/functions';
import { type SchemeType } from '../database';
import { type FirebaseFunctions } from '../FirebaseFunctions';

export class FirebaseApp<FFunctions extends FirebaseFunctions, DatabaseScheme extends SchemeType> {
    private readonly _functions: Functions;
    private readonly _database: Database;
    private readonly _auth: Auth;

    public constructor(
        options: FirebaseOptions,
        private readonly cryptionKeys: Crypter.Keys,
        private readonly callSecretKey: string,
        config?: FirebaseApp.Config
    ) {
        const app = initializeApp(options, config?.name);
        this._functions = getFunctions(app, config?.functionsRegion);
        this._database = getDatabase(app, config?.databaseUrl);
        this._auth = getAuth(app);
    }

    public get functions(): FirebaseFunctionsTester<FFunctions> {
        return new FirebaseFunctionsTester(this._functions, this.cryptionKeys, this.callSecretKey);
    }

    public get database(): FirebaseDatabase<DatabaseScheme> {
        return new FirebaseDatabase(this._database, this.cryptionKeys);
    }

    public get auth(): FirebaseAuth {
        return new FirebaseAuth(this._auth);
    }
}

export namespace FirebaseApp {
    export interface Config {
        name?: string;
        functionsRegion?: string;
        databaseUrl?: string;
    }
}
