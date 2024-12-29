import type * as functions from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import { FunctionsLogger } from '../logger';
import { Logger } from '@stevenkellner/typescript-common-functionality';

export abstract class FirebaseSchedule {

    protected logger = new Logger(new FunctionsLogger());

    protected constructor(scheduleName: string) {
        this.logger.notice(`${scheduleName}.constructor`);
    }

    public abstract execute(): Promise<void>;
}

export namespace FirebaseSchedule {

    export type Constructor = new () => FirebaseSchedule;

    export class ConstructorWrapper {

        public constructor(
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public readonly Constructor: FirebaseSchedule.Constructor,
            public readonly schedule: string,
            public readonly timezone: string
        ) {}
    }

    export function create(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        FirebaseSchedule: FirebaseSchedule.Constructor,
        schedule: string,
        timezone: string,
        region: SupportedRegion | null
    ): functions.scheduler.ScheduleFunction {
        return onSchedule({
            schedule: schedule,
            timeZone: timezone,
            region: region ?? undefined
        }, async () => {
            const firebaseSchedule = new FirebaseSchedule();
            await firebaseSchedule.execute();
        });
    }
}
