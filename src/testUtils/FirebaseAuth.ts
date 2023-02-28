import { signInWithEmailAndPassword, type UserCredential, type Auth, signOut, type User } from 'firebase/auth';

export class FirebaseAuth {
    public constructor(
        private readonly auth: Auth
    ) {}

    public get currentUser(): User | null {
        return this.auth.currentUser;
    }

    public async signIn(email: string, password: string): Promise<UserCredential> {
        return await signInWithEmailAndPassword(this.auth, email, password);
    }

    public async signOut() {
        if (this.currentUser !== null)
            await signOut(this.auth);
    }
}
