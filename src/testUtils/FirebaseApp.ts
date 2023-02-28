import { type Crypter } from '../crypter';
import { type FirebaseOptions, initializeApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';
import { getAuth, type Auth } from 'firebase/auth';
import { FirebaseFunctions } from './FirebaseFunctions';
import { FirebaseDatabase } from './FirebaseDatabase';
import { FirebaseAuth } from './FirebaseAuth';
import { type Functions, getFunctions } from 'firebase/functions';
import { type SchemeType } from '../database';
import { type FirebaseFunctionsType } from '../FirebaseFunctionsType';

export class FirebaseApp<FFunctions extends FirebaseFunctionsType, DatabaseScheme extends SchemeType> {
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

    public get functions(): FirebaseFunctions<FFunctions> {
        return new FirebaseFunctions(this._functions, this.cryptionKeys, this.callSecretKey);
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
