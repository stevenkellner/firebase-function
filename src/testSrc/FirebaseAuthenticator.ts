import type { FirebaseApp } from './FirebaseApp';
import { type Auth as AuthInstance, createUserWithEmailAndPassword, signInWithEmailAndPassword, type UserCredential } from 'firebase/auth';

export class FirebaseAuthenticator {

    public constructor(
        private readonly options: FirebaseApp.Options,
        private readonly authInstance: AuthInstance
    ) {}

    public async createUser(email: string, password: string): Promise<UserCredential> {
        return createUserWithEmailAndPassword(this.authInstance, email, password);
    }

    public async signIn(email: string, password: string): Promise<UserCredential> {
        return signInWithEmailAndPassword(this.authInstance, email, password);
    }
}
