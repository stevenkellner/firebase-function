import type * as functions from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import type { SupportedRegion } from 'firebase-functions/v2/options';

export abstract class FirebaseSchedule {

    public abstract execute(): Promise<void>;
}

export namespace FirebaseSchedule {

    export type Constructor = new () => FirebaseSchedule;

    export class AdminSchedule {

        public constructor(
            private readonly FirebaseSchedule: FirebaseSchedule.Constructor,
            private readonly schedule: string,
            private readonly timezone: string
        ) {}

        private async execute(): Promise<void> {
            const firebaseSchedule = new this.FirebaseSchedule();
            await firebaseSchedule.execute();
        }

        public runnable(
            region: SupportedRegion | null
        ): functions.scheduler.ScheduleFunction {
            return onSchedule({
                schedule: this.schedule,
                timeZone: this.timezone,
                region: region ?? undefined
            }, async () => {
                await this.execute();
            });
        }
    }
}
