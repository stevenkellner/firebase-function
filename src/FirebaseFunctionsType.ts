import type * as functions from 'firebase-functions';
import { type DatabaseType } from './DatabaseType';
import { FirebaseFunction, type FirebaseFunctionType } from './FirebaseFunction';
import { type FunctionType } from './FunctionType';
import { type PrivateKeys } from './PrivateKeys';
import { type ValidReturnType } from './ValidReturnType';

export type FirebaseFunctionDescriptor<T extends FunctionType<unknown, ValidReturnType, unknown>> = () => FirebaseFunctionType<T>;

export namespace FirebaseFunctionDescriptor {
    export type Parameters<T extends FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>>> = T extends FirebaseFunctionDescriptor<infer U> ? FunctionType.Parameters<U> : never;

    export type ReturnType<T extends FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>>> = T extends FirebaseFunctionDescriptor<infer U> ? FunctionType.ReturnType<U> : never;

    export type FlattenParameters<T extends FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>>> = T extends FirebaseFunctionDescriptor<infer U> ? FunctionType.FlattenParameters<U> : never;

    export function create<T extends FunctionType<unknown, ValidReturnType, unknown>>(firebaseFunctions: FirebaseFunctionType<T>): FirebaseFunctionDescriptor<T> {
        return () => firebaseFunctions;
    }
}

export type FirebaseFunctionsType = FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>> | { [key: string]: FirebaseFunctionsType };

export type FirebaseRunnableFunctions = (functions.HttpsFunction & functions.Runnable<unknown>) | { [key: string]: FirebaseRunnableFunctions };

export function createFirebaseFunctions(
    getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys,
    firebaseFunctions: Record<string, FirebaseFunctionsType>,
    debugFirebaseFunctions: Record<string, FirebaseFunctionsType> = {}
): FirebaseRunnableFunctions {
    return {
        debug: createFirebaseFunctionsType(debugFirebaseFunctions, getPrivateKeys),
        ...createFirebaseFunctionsType(firebaseFunctions, getPrivateKeys)
    };
}

function createFirebaseFunctionsType(firebaseFunctions: FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys): (functions.HttpsFunction & functions.Runnable<unknown>);
function createFirebaseFunctionsType(firebaseFunctions: Record<string, FirebaseFunctionsType>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys): Record<string, FirebaseRunnableFunctions>;
function createFirebaseFunctionsType(firebaseFunctions: FirebaseFunctionsType, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys): FirebaseRunnableFunctions;
function createFirebaseFunctionsType(
    firebaseFunctions: FirebaseFunctionsType,
    getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys
): FirebaseRunnableFunctions {
    if (typeof firebaseFunctions === 'function')
        return FirebaseFunction.create(firebaseFunctions(), getPrivateKeys);
    const firebaseRunnableFunctions: Record<string, FirebaseRunnableFunctions> = {};
    for (const entry of Object.entries(firebaseFunctions))
        firebaseRunnableFunctions[entry[0]] = createFirebaseFunctionsType(entry[1], getPrivateKeys);
    return firebaseRunnableFunctions;
}
