import { FirebaseSchedule } from "../../../../lib/admin";

export class TestFirebaseSchedule extends FirebaseSchedule {

    public constructor() {
        super("TestFirebaseSchedule");
    }

    public async execute(): Promise<void> {
        this.logger.notice("TestFirebaseSchedule.execute");
    }
}
