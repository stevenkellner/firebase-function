import { FirebaseSchedule } from "../../../../lib/admin";

export class TestFirebaseSchedule extends FirebaseSchedule {

    public constructor() {
        super();
        this.logger.notice("TestFirebaseSchedule.constructor");
    }

    public async execute(): Promise<void> {
        this.logger.notice("TestFirebaseSchedule.execute");
    }
}
