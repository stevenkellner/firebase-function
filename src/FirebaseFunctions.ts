import type * as functions from 'firebase-functions';
import { DatabaseType } from './DatabaseType';
import { FirebaseFunction, type FirebaseFunctionConstructor } from './FirebaseFunction';
import { type FunctionType } from './FunctionType';
import { type PrivateKeys } from './PrivateKeys';
import { type ValidReturnType } from './ValidReturnType';
import { FirebaseSchedule, type FirebaseScheduleConstructor } from './FirebaseSchedule';
import { FirebaseRequest, type FirebaseRequestConstructor } from './FirebaseRequest';

export type FirebaseFunctionDescriptor<T extends FunctionType<unknown, ValidReturnType, unknown>> = [FirebaseFunctionConstructor<T>];

export namespace FirebaseFunctionDescriptor {
    export type Parameters<T extends FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>>> = T extends FirebaseFunctionDescriptor<infer U> ? FunctionType.Parameters<U> : never;

    export type ReturnType<T extends FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>>> = T extends FirebaseFunctionDescriptor<infer U> ? FunctionType.ReturnType<U> : never;

    export type FlattenParameters<T extends FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>>> = T extends FirebaseFunctionDescriptor<infer U> ? FunctionType.FlattenParameters<U> : never;

    export function create<T extends FunctionType<unknown, ValidReturnType, unknown>>(firebaseFunction: FirebaseFunctionConstructor<T>): FirebaseFunctionDescriptor<T> {
        return [firebaseFunction];
    }
}

export type FirebaseRequestDescriptor<T extends FunctionType<unknown, ValidReturnType, Record<string, string>>> = [FirebaseRequestConstructor<T>, void, void];

export namespace FirebaseRequestDescriptor {
    export type Parameters<T extends FirebaseRequestDescriptor<FunctionType<unknown, ValidReturnType, Record<string, string>>>> = T extends FirebaseRequestDescriptor<infer U> ? FunctionType.Parameters<U> : never;

    export type ReturnType<T extends FirebaseRequestDescriptor<FunctionType<unknown, ValidReturnType, Record<string, string>>>> = T extends FirebaseRequestDescriptor<infer U> ? FunctionType.ReturnType<U> : never;

    export type FlattenParameters<T extends FirebaseRequestDescriptor<FunctionType<unknown, ValidReturnType, Record<string, string>>>> = T extends FirebaseRequestDescriptor<infer U> ? FunctionType.FlattenParameters<U> : never;

    export function create<T extends FunctionType<unknown, ValidReturnType, Record<string, string>>>(firebaseRequest: FirebaseRequestConstructor<T>): FirebaseRequestDescriptor<T> {
        return [firebaseRequest, undefined, undefined];
    }
}

export type FirebaseFunctions =
    | FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>>
    | [string, FirebaseScheduleConstructor]
    | FirebaseRequestDescriptor<FunctionType<unknown, ValidReturnType, Record<string, string>>>
    | { [key: string]: FirebaseFunctions };

export type FirebaseRunnableFunctions =
    | (functions.HttpsFunction & functions.Runnable<unknown>)
    | functions.CloudFunction<unknown>
    | functions.HttpsFunction
    | { [key: string]: FirebaseRunnableFunctions };

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

function createFirebaseFunctionsType(firebaseFunction: FirebaseFunctionDescriptor<FunctionType<unknown, ValidReturnType, unknown>>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): (functions.HttpsFunction & functions.Runnable<unknown>);
function createFirebaseFunctionsType(firebaseSchedule: [string, FirebaseScheduleConstructor], getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): functions.CloudFunction<unknown>;
function createFirebaseFunctionsType(firebaseRequest: FirebaseRequestDescriptor<FunctionType<unknown, ValidReturnType, Record<string, string>>>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): functions.HttpsFunction;
function createFirebaseFunctionsType(firebaseFunctions: Record<string, FirebaseFunctions>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): Record<string, FirebaseRunnableFunctions>;
function createFirebaseFunctionsType(firebaseFunctions: FirebaseFunctions, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): FirebaseRunnableFunctions;
function createFirebaseFunctionsType(
    firebaseFunctions: FirebaseFunctions,
    getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys,
    databaseType: DatabaseType
): FirebaseRunnableFunctions {
    if (Array.isArray(firebaseFunctions)) {
        if (firebaseFunctions.length === 1)
            return FirebaseFunction.create(firebaseFunctions[0], getPrivateKeys);
        if (firebaseFunctions.length === 2)
            return FirebaseSchedule.create(firebaseFunctions[0], () => new firebaseFunctions[1](databaseType));
        if (firebaseFunctions.length === 3)
            return FirebaseRequest.create(firebaseFunctions[0]);
    }
    const firebaseRunnableFunctions: Record<string, FirebaseRunnableFunctions> = {};
    for (const entry of Object.entries(firebaseFunctions))
        firebaseRunnableFunctions[entry[0]] = createFirebaseFunctionsType(entry[1], getPrivateKeys, databaseType);
    return firebaseRunnableFunctions;
}
