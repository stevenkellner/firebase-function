// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FirebaseSchedule {}

export interface FirebaseExecutableSchedule extends FirebaseSchedule {

    execute(): Promise<void>;
}

export namespace FirebaseSchedule {

    export type Constructor = new () => FirebaseSchedule;

    export type ExecutableConstructor = new () => FirebaseExecutableSchedule;
}
