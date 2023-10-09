import { type Auth, type User, type UserCredential, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export class FirebaseAuth {
    public constructor(
        private readonly auth: Auth
    ) {}

    public get currentUser(): User | null {
        return this.auth.currentUser;
    }

    public async signIn(email: string, password: string): Promise<UserCredential> {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

    public async signOut(): Promise<void> {
        if (this.currentUser !== null)
            await signOut(this.auth);
    }
}
