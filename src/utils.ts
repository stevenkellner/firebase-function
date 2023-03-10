export type ObjectValue<T> =
    T extends Record<PropertyKey, infer V> ? V :
        T extends Array<infer E> ? E : never;
