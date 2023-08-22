import * as functions from 'firebase-functions';
import { type DatabaseType } from './DatabaseType';

export type FirebaseScheduleConstructor = new (databaseType: DatabaseType) => FirebaseSchedule;

export interface FirebaseSchedule {
    executeFunction(): Promise<void>;
}

export namespace FirebaseSchedule {
    export function create(
        schedule: string,
        createFirebaseSchedule: (context: functions.EventContext<Record<string, string>>) => FirebaseSchedule
    ): functions.CloudFunction<unknown> {
        return functions
            .region('europe-west1')
            .pubsub
            .schedule(schedule)
            .timeZone('Europe/Berlin')
            .onRun(async context => {
                const firebaseFunction = createFirebaseSchedule(context);
                await firebaseFunction.executeFunction();
            });
    }
}
