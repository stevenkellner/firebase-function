import { Crypter } from '../crypter';
import { DatabaseType } from '../DatabaseType';
import { type FirebaseFunction } from '../FirebaseFunction';
import { getFunctions, httpsCallable, type Functions } from 'firebase/functions';
import { type Logger } from '../logger';
import { type FirebaseOptions, initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref, set, type Database } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, type UserCredential, type Auth, signOut, type User } from 'firebase/auth';

export class FirebaseApp {
    private readonly _functions: Functions;
    private readonly _database: Database;
    private readonly _auth: Auth;

    public constructor(
        options: FirebaseOptions,
        private readonly cryptionKeys: Crypter.Keys,
        config?: FirebaseApp.Config
    ) {
        const app = initializeApp(options, config?.name);
        this._functions = getFunctions(app, config?.functionsRegion);
        this._database = getDatabase(app, config?.databaseUrl);
        this._auth = getAuth(app);
    }

    public get functions(): FirebaseFunctions {
        return new FirebaseFunctions(this._functions, this.cryptionKeys);
    }

    public get database(): FirebaseDatabase {
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

export class FirebaseFunctions {
    public constructor(
        private readonly functions: Functions,
        private readonly cryptionKeys: Crypter.Keys
    ) {}

    public async call<Params, ResultType>(functionName: string, parameters: Params): Promise<FirebaseFunction.Result<ResultType>> {
        const databaseType = new DatabaseType('testing');
        const crypter = new Crypter(this.cryptionKeys);
        const callableFunction = httpsCallable<{
            verbose: Logger.VerboseType;
            databaseType: DatabaseType.Value;
            parameters: string;
        }, string>(this.functions, functionName);
        const httpsCallableResult = await callableFunction({
            verbose: 'coloredVerbose',
            databaseType: databaseType.value,
            parameters: crypter.encodeEncrypt(parameters)
        });
        return await crypter.decryptDecode(httpsCallableResult.data);
    }
}

export class FirebaseDatabase {
    public constructor(
        private readonly database: Database,
        private readonly cryptionKeys: Crypter.Keys
    ) {}

    public async getOptional<T>(path: string): Promise<T | null> {
        const reference = ref(this.database, path);
        return await new Promise<T | null>(resolve => {
            onValue(reference, snapshot => {
                if (!snapshot.exists())
                    return resolve(null);
                resolve(snapshot.val());
            });
        });
    }

    public async get<T>(path: string): Promise<T> {
        const value = await this.getOptional<T>(path);
        if (value === null)
            throw new Error('No data in snapshot.');
        return value;
    }

    public async getDecryptedOptional<T>(path: string): Promise<T | null> {
        const crypter = new Crypter(this.cryptionKeys);
        const value = await this.getOptional<string>(path);
        if (value === null)
            return null;
        return crypter.decryptDecode<T>(value);
    }

    public async getDecrypted<T>(path: string): Promise<T> {
        const crypter = new Crypter(this.cryptionKeys);
        const value = await this.get<string>(path);
        return crypter.decryptDecode<T>(value);
    }

    public async set(path: string, value: FirebaseDatabase.ValueType) {
        const reference = ref(this.database, path);
        await set(reference, value);
    }

    public async setEncrypted(path: string, value: FirebaseDatabase.ValueType) {
        const crypter = new Crypter(this.cryptionKeys);
        await this.set(path, crypter.encodeEncrypt(value));
    }

    public async exists(path: string): Promise<boolean> {
        return (await this.getOptional(path)) !== null;
    }
}

export namespace FirebaseDatabase {
    export type ValueType = null | boolean | string | number | ValueType[] | { [key: string]: ValueType };
}

export class FirebaseAuth {
    public constructor(
        private readonly auth: Auth
    ) {}

    public getCurrentUser(): User | null {
        return this.auth.currentUser;
    }

    public async signIn(email: string, password: string): Promise<UserCredential> {
        return await signInWithEmailAndPassword(this.auth, email, password);
    }

    public async signOut() {
        if (this.getCurrentUser !== null)
            await signOut(this.auth);
    }
}
