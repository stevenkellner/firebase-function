import type { FirebaseSchedule, FirebaseExecutableSchedule } from '../../../src';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MyFirebaseSchedule implements FirebaseSchedule {}

export class MyFirebaseExecutableSchedule extends MyFirebaseSchedule implements FirebaseExecutableSchedule {

    public async execute(): Promise<void> {}
}
