export type ValidReturnType =
    | boolean
    | string
    | number
    | null
    | void
    | ValidReturnType[]
    | { [key: string]: ValidReturnType };
