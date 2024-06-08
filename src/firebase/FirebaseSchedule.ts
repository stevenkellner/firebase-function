import * as functions from 'firebase-functions';

export interface FirebaseSchedule {

    execute(): Promise<void>;
}

export type FirebaseScheduleConstructor = new () => FirebaseSchedule;

export namespace FirebaseSchedule {
    export function create(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        FirebaseSchedule: FirebaseScheduleConstructor,
        schedule: string,
        timezone: string,
        regions: string[] = []
    ): functions.CloudFunction<unknown> {
        return functions.region(...regions).pubsub.schedule(schedule).timeZone(timezone).onRun(async () => {
            const firebaseSchedule = new FirebaseSchedule();
            await firebaseSchedule.execute();
        });
    }
}
