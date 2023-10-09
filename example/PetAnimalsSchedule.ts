import type { DatabaseType, IDatabaseReference, IFirebaseSchedule } from '../src';
import type { DatabaseScheme } from './DatabaseScheme';

export class PetAnimalsSchedule implements IFirebaseSchedule {
    public constructor(
        databaseType: DatabaseType,
        private readonly databaseReference: IDatabaseReference<DatabaseScheme>
    ) {}

    public async execute(): Promise<void> {
        const snapshot = await this.databaseReference.child('animals').snapshot();
        if (!snapshot.exists)
            return;
        snapshot.forEach(snapshot => {
            this.pet(snapshot.value());
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private pet(animal: { name: string }): void {}
}
