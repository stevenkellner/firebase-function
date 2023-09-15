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
        private readonly config?: FirebaseApp.Config
    ) {
        const app = initializeApp(options, this.config?.name);
        this._functions = getFunctions(app, this.config?.functionsRegion);
        this._database = getDatabase(app, this.config?.databaseUrl);
        this._auth = getAuth(app);
    }

    public get functions(): FirebaseFunctionsTester<FFunctions> {
        const requestUrlComponent = this.config?.functionsRegion !== undefined && this.config?.projectId !== undefined ? `${this.config.functionsRegion}-${this.config.projectId}` : `${this.config?.functionsRegion ?? ''}${this.config?.projectId ?? ''}`;
        return new FirebaseFunctionsTester(this._functions, requestUrlComponent, this.cryptionKeys, this.callSecretKey);
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
        projectId?: string;
        functionsRegion?: string;
        databaseUrl?: string;
    }
}
