import * as functions from 'firebase-functions';
import { type PrivateKeys, type DatabaseType } from './types';
import { type IDatabaseScheme, type IDatabaseReference, DatabaseReference } from './database';

export interface IFirebaseSchedule {
    execute(): Promise<void>;
}

declare let IFirebaseSchedule: FirebaseSchedule.Constructor;

export namespace FirebaseSchedule {
    export type Constructor = new (databaseType: DatabaseType, databaseReference: IDatabaseReference<IDatabaseScheme>) => IFirebaseSchedule;

    export function create(
        FirebaseSchedule: FirebaseSchedule.Constructor,
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
                const databaseReference = DatabaseReference.base(getPrivateKeys(databaseType));
                const firebaseFunction = new FirebaseSchedule(databaseType, databaseReference);
                await firebaseFunction.execute();
            });
    }
}
