export abstract class FirebaseSchedule {

    public abstract execute(): Promise<void>;
}

export namespace FirebaseSchedule {

    export type Constructor = new () => FirebaseSchedule;
}
