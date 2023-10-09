export type ValidReturnType =
    | boolean
    | string
    | number
    | null
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    | void
    | ValidReturnType[]
    | { [key: string]: ValidReturnType };
