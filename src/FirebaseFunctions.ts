import type * as functions from 'firebase-functions';
import { DatabaseType, type IFunctionType, type PrivateKeys } from './types';
import type { FirebaseDescriptor } from './FirebaseDescriptor';
import type { IDatabaseScheme } from './database';
import { IFirebaseFunction } from './IFirebaseFunction';
import { IFirebaseRequest } from './IFirebaseRequest';
import { IFirebaseSchedule } from './IFirebaseSchedule';

export type FirebaseFunctions<DatabaseScheme extends IDatabaseScheme = any> =
    | FirebaseDescriptor<DatabaseScheme>
    | { [key: string]: FirebaseFunctions<DatabaseScheme> };

export type RunnableFirebaseFunctions =
    | (functions.HttpsFunction & functions.Runnable<unknown>)
    | functions.CloudFunction<unknown>
    | functions.HttpsFunction
    | { [key: string]: RunnableFirebaseFunctions };

function createFirebaseFunctionsType<DatabaseScheme extends IDatabaseScheme>(firebaseFunction: FirebaseDescriptor.Function<IFunctionType.Erased, unknown, DatabaseScheme>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): (functions.HttpsFunction & functions.Runnable<unknown>);
function createFirebaseFunctionsType<DatabaseScheme extends IDatabaseScheme>(firebaseRequest: FirebaseDescriptor.Request<IFunctionType.Erased, DatabaseScheme>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): functions.HttpsFunction;
function createFirebaseFunctionsType<DatabaseScheme extends IDatabaseScheme>(firebaseSchedule: FirebaseDescriptor.Schedule<DatabaseScheme>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): functions.CloudFunction<unknown>;
function createFirebaseFunctionsType<DatabaseScheme extends IDatabaseScheme>(firebaseFunctions: Record<string, FirebaseFunctions<DatabaseScheme>>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): Record<string, RunnableFirebaseFunctions>;
function createFirebaseFunctionsType<DatabaseScheme extends IDatabaseScheme>(firebaseFunctions: FirebaseFunctions<DatabaseScheme>, getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys, databaseType: DatabaseType): RunnableFirebaseFunctions;
function createFirebaseFunctionsType<DatabaseScheme extends IDatabaseScheme>(
    firebaseFunctions: FirebaseFunctions<DatabaseScheme>,
    getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys,
    databaseType: DatabaseType
): RunnableFirebaseFunctions {
    if (Array.isArray(firebaseFunctions)) {
        if (firebaseFunctions.length === 1)
            return IFirebaseFunction.create(firebaseFunctions[0], getPrivateKeys);
        if (firebaseFunctions.length === 2)
            return IFirebaseRequest.create(firebaseFunctions[0], getPrivateKeys);
        return IFirebaseSchedule.create(firebaseFunctions[0], getPrivateKeys, firebaseFunctions[1], databaseType);
    }
    const runnableFirebaseFunctions: Record<string, RunnableFirebaseFunctions> = {};
    for (const entry of Object.entries(firebaseFunctions))
        runnableFirebaseFunctions[entry[0]] = createFirebaseFunctionsType(entry[1], getPrivateKeys, databaseType);
    return runnableFirebaseFunctions;
}

export function createFirebaseFunctions<DatabaseScheme extends IDatabaseScheme>(
    getPrivateKeys: (databaseType: DatabaseType) => PrivateKeys,
    firebaseFunctions: Record<string, FirebaseFunctions<DatabaseScheme>>,
    debugFirebaseFunctions: Record<string, FirebaseFunctions<DatabaseScheme>> = {}
): RunnableFirebaseFunctions {
    return {
        debug: createFirebaseFunctionsType(debugFirebaseFunctions, getPrivateKeys, new DatabaseType('debug')),
        ...createFirebaseFunctionsType(firebaseFunctions, getPrivateKeys, new DatabaseType('release'))
    };
}
