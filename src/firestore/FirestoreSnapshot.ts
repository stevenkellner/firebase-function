import type { Flattable } from '@stevenkellner/typescript-common-functionality';

export class FirestoreSnapshot<Values> {

    public constructor(
        private readonly snapshot: FirebaseFirestore.DocumentSnapshot<Flattable.Flatten<Values>>
    ) {}

    public get exists(): boolean {
        return this.snapshot.exists;
    }

    public get data(): Flattable.Flatten<Values> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.snapshot.data()!;
    }
}
