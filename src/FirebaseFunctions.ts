import type * as functions from 'firebase-functions';
import { DatabaseType } from './DatabaseType';
import { FirebaseFunction, type FirebaseFunctionConstructor } from './FirebaseFunction';
import { type FunctionType } from './FunctionType';
import { type PrivateKeys } from './PrivateKeys';
import { type ValidReturnType } from './ValidReturnType';
import { FirebaseSchedule, type FirebaseScheduleConstructor } from './FirebaseSchedule';

export type FirebaseFunctionDescriptor<T extends FunctionType<unknown, ValidReturnType, unknown>> = () => FirebaseFunctionConstructor<T>;

export namespace FirebaseFunctionDescriptor {
    export type Parameters<T extends FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>>> = T extends FirebaseFunctionDescriptor<infer U> ? FunctionType.Parameters<U> : never;

    export type ReturnType<T extends FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>>> = T extends FirebaseFunctionDescriptor<infer U> ? FunctionType.ReturnType<U> : never;

    export type FlattenParameters<T extends FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>>> = T extends FirebaseFunctionDescriptor<infer U> ? FunctionType.FlattenParameters<U> : never;

    export function create<T extends FunctionType<unknown, ValidReturnType, unknown>>(firebaseFunctions: FirebaseFunctionConstructor<T>): FirebaseFunctionDescriptor<T> {
        return () => firebaseFunctions;
    }
}

export type FirebaseFunctions = FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>> | [string, FirebaseScheduleConstructor] | { [key: string]: FirebaseFunctions };

export type FirebaseRunnableFunctions = (functions.HttpsFunction & functions.Runnable<unknown>) | functions.CloudFunction<unknown> | { [key: string]: FirebaseRunnableFunctions };

export function createFirebaseFunctions(
    getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys,
    firebaseFunctions: Record<string, FirebaseFunctions>,
    debugFirebaseFunctions: Record<string, FirebaseFunctions> = {}
): FirebaseRunnableFunctions {
    return {
        debug: createFirebaseFunctionsType(debugFirebaseFunctions, getPrivateKeys, new DatabaseType('debug')),
        ...createFirebaseFunctionsType(firebaseFunctions, getPrivateKeys, new DatabaseType('release'))
    };
}

function createFirebaseFunctionsType(firebaseFunctions: FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): (functions.HttpsFunction & functions.Runnable<unknown>);
function createFirebaseFunctionsType(firebaseFunctions: [string, FirebaseScheduleConstructor], getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): functions.CloudFunction<unknown>;
function createFirebaseFunctionsType(firebaseFunctions: Record<string, FirebaseFunctions>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): Record<string, FirebaseRunnableFunctions>;
function createFirebaseFunctionsType(firebaseFunctions: FirebaseFunctions, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): FirebaseRunnableFunctions;
function createFirebaseFunctionsType(
    firebaseFunctions: FirebaseFunctions,
    getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys,
    databaseType: DatabaseType
): FirebaseRunnableFunctions {
    if (typeof firebaseFunctions === 'function')
        return FirebaseFunction.create(firebaseFunctions(), getPrivateKeys);
    if (Array.isArray(firebaseFunctions)) {
        return FirebaseSchedule.create(firebaseFunctions[0], () => new firebaseFunctions[1](databaseType));
    }
    const firebaseRunnableFunctions: Record<string, FirebaseRunnableFunctions> = {};
    for (const entry of Object.entries(firebaseFunctions))
        firebaseRunnableFunctions[entry[0]] = createFirebaseFunctionsType(entry[1], getPrivateKeys, databaseType);
    return firebaseRunnableFunctions;
}
