export type ObjectValue<T> =
    T extends Record<PropertyKey, infer V> ? V :
        T extends (infer E)[] ? E : never;
