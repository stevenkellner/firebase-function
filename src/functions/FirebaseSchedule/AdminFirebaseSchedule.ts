import type * as functions from 'firebase-functions';
import type { onSchedule as firebaseOnSchedule } from 'firebase-functions/v2/scheduler';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import type { FirebaseSchedule } from './FirebaseSchedule';

export class AdminFirebaseSchedule {

    public constructor(
        private readonly FirebaseSchedule: FirebaseSchedule.ExecutableConstructor,
        private readonly schedule: string,
        private readonly timezone: string,
        private readonly onSchedule: typeof firebaseOnSchedule
    ) {}

    private async execute(): Promise<void> {
        const firebaseSchedule = new this.FirebaseSchedule();
        await firebaseSchedule.execute();
    }

    public runnable(
        region: SupportedRegion | null
    ): functions.scheduler.ScheduleFunction {
        return this.onSchedule({
            schedule: this.schedule,
            timeZone: this.timezone,
            region: region ?? undefined
        }, async () => {
            await this.execute();
        });
    }
}
