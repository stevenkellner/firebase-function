import * as functions from 'firebase-functions';
import { type PrivateKeys, type DatabaseType } from './types';
import { type IDatabaseScheme, type IDatabaseReference, DatabaseReference } from './database';

export interface IFirebaseSchedule {
    execute(): Promise<void>;
}

export namespace IFirebaseSchedule {
    export type Constructor<DatabaseScheme extends IDatabaseScheme> = new (databaseType: DatabaseType, databaseReference: IDatabaseReference<DatabaseScheme>) => IFirebaseSchedule;

    export function create<DatabaseScheme extends IDatabaseScheme>(
        FirebaseSchedule: IFirebaseSchedule.Constructor<DatabaseScheme>,
        getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys,
        schedule: string,
        databaseType: DatabaseType
    ): functions.CloudFunction<unknown> {
        return functions
            .region('europe-west1')
            .pubsub
            .schedule(schedule)
            .timeZone('Europe/Berlin')
            .onRun(async () => {
                const databaseReference = DatabaseReference.base<DatabaseScheme>(getPrivateKeys(databaseType));
                const firebaseFunction = new FirebaseSchedule(databaseType, databaseReference);
                await firebaseFunction.execute();
            });
    }
}
