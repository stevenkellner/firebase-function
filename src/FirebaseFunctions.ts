import type * as functions from 'firebase-functions';
import { DatabaseType, type IFunctionType, type PrivateKeys } from './types';
import { type FirebaseDescriptor } from './FirebaseDescriptor';
import { FirebaseFunction } from './IFirebaseFunction';
import { FirebaseRequest } from './IFirebaseRequest';
import { FirebaseSchedule } from './IFirebaseSchedule';

export type FirebaseFunctions =
    | FirebaseDescriptor
    | { [key: string]: FirebaseFunctions };

export type RunnableFirebaseFunctions =
    | (functions.HttpsFunction & functions.Runnable<unknown>)
    | functions.CloudFunction<unknown>
    | functions.HttpsFunction
    | { [key: string]: RunnableFirebaseFunctions };

export function createFirebaseFunctions(
    getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys,
    firebaseFunctions: Record<string, FirebaseFunctions>,
    debugFirebaseFunctions: Record<string, FirebaseFunctions> = {}
): RunnableFirebaseFunctions {
    return {
        debug: createFirebaseFunctionsType(debugFirebaseFunctions, getPrivateKeys, new DatabaseType('debug')),
        ...createFirebaseFunctionsType(firebaseFunctions, getPrivateKeys, new DatabaseType('release'))
    };
}

function createFirebaseFunctionsType(firebaseFunction: FirebaseDescriptor.Function<IFunctionType.Erased, unknown>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): (functions.HttpsFunction & functions.Runnable<unknown>);
function createFirebaseFunctionsType(firebaseRequest: FirebaseDescriptor.Request<IFunctionType.Erased>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): functions.HttpsFunction;
function createFirebaseFunctionsType(firebaseSchedule: FirebaseDescriptor.Schedule, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): functions.CloudFunction<unknown>;
function createFirebaseFunctionsType(firebaseFunctions: Record<string, FirebaseFunctions>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): Record<string, RunnableFirebaseFunctions>;
function createFirebaseFunctionsType(firebaseFunctions: FirebaseFunctions, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): RunnableFirebaseFunctions;
function createFirebaseFunctionsType(
    firebaseFunctions: FirebaseFunctions,
    getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys,
    databaseType: DatabaseType
): RunnableFirebaseFunctions {
    if (Array.isArray(firebaseFunctions)) {
        if (firebaseFunctions.length === 1)
            return FirebaseFunction.create(firebaseFunctions[0], getPrivateKeys);
        if (firebaseFunctions.length === 2)
            return FirebaseRequest.create(firebaseFunctions[0], getPrivateKeys);
        if (firebaseFunctions.length === 3)
            return FirebaseSchedule.create(firebaseFunctions[0], getPrivateKeys, firebaseFunctions[1], databaseType);
    }
    const runnableFirebaseFunctions: Record<string, RunnableFirebaseFunctions> = {};
    for (const entry of Object.entries(firebaseFunctions))
        runnableFirebaseFunctions[entry[0]] = createFirebaseFunctionsType(entry[1], getPrivateKeys, databaseType);
    return runnableFirebaseFunctions;
}
