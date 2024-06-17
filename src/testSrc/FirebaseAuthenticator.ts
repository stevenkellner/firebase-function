import type { FirebaseApp } from './FirebaseApp';
import { type Auth as AuthInstance, createUserWithEmailAndPassword, signInWithEmailAndPassword, type UserCredential, signOut } from 'firebase/auth';

export class FirebaseAuthenticator {

    public constructor(
        private readonly options: FirebaseApp.Options,
        private readonly authInstance: AuthInstance
    ) {}

    public async signIn(email: string, password: string): Promise<UserCredential> {
        try {
            return await createUserWithEmailAndPassword(this.authInstance, email, password);
        } catch {
            return await signInWithEmailAndPassword(this.authInstance, email, password);

        }
    }

    public async signOut(): Promise<void> {
        await signOut(this.authInstance);
    }
}
