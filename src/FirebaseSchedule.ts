import * as functions from 'firebase-functions';

/**
 * Firebase schedule with a execute method.
 */
export interface FirebaseSchedule {
    /**
     * Executes the firebase schedule.
     */
    executeFunction(): Promise<void>;
}

export namespace FirebaseSchedule {
    export function create<
        FSchedule extends FirebaseSchedule
    >(
        schedule: string,
        createFirebaseSchedule: (context: functions.EventContext<Record<string, string>>) => FSchedule
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
