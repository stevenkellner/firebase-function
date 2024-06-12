export class FirestoreSnapshot<Values> {

    public constructor(
        private readonly snapshot: FirebaseFirestore.DocumentSnapshot<Values>
    ) {}

    public get exists(): boolean {
        return this.snapshot.exists;
    }

    public get data(): Values {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.snapshot.data()!;
    }
}
