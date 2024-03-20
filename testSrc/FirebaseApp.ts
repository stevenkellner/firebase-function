import { type Auth, getAuth } from 'firebase/auth';
import { type Database, getDatabase } from 'firebase/database';
import { type FirebaseOptions, initializeApp } from 'firebase/app';
import { type Functions, getFunctions } from 'firebase/functions';
import { FirebaseAuth } from './FirebaseAuth';
import { FirebaseDatabase } from './FirebaseDatabase';
import type { FirebaseFunctions } from '../src/FirebaseFunctions';
import { FirebaseFunctions as FirebaseFunctionsTester } from './FirebaseFunctions';
import type { IDatabaseScheme } from '../src/database';

export class FirebaseApp<FFunctions extends FirebaseFunctions<DatabaseScheme>, DatabaseScheme extends IDatabaseScheme> {
    private readonly _functions: Functions;

    private readonly _database: Database;

    private readonly _auth: Auth;

    public constructor(
        options: FirebaseOptions,
        private readonly callSecretKey: string,
        private readonly config?: FirebaseApp.Config
    ) {
        const app = initializeApp(options, this.config?.name);
        this._functions = getFunctions(app, this.config?.functionsRegion);
        this._database = getDatabase(app, this.config?.databaseUrl);
        this._auth = getAuth(app);
    }

    public get functions(): FirebaseFunctionsTester<FFunctions, DatabaseScheme> {
        // eslint-disable-next-line no-undefined
        const requestUrlComponent = this.config?.functionsRegion !== undefined && this.config.projectId !== undefined ? `${this.config.functionsRegion}-${this.config.projectId}` : `${this.config?.functionsRegion ?? ''}${this.config?.projectId ?? ''}`;
        return new FirebaseFunctionsTester(this._functions, requestUrlComponent, this.callSecretKey);
    }

    public get database(): FirebaseDatabase<DatabaseScheme> {
        return new FirebaseDatabase(this._database);
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
