import type * as functions from 'firebase-functions';
import { type Crypter } from './crypter';
import { type DatabaseType } from './DatabaseType';
import { type FirebaseFunctionType, FirebaseFunction } from './FirebaseFunction';
import { type FunctionType } from './FunctionType';
import { type ValidReturnType } from './ValidReturnType';

export type FirebaseFunctions = FirebaseFunctionType<FirebaseFunction<FunctionType<unknown, ValidReturnType, unknown>>> | { [key: string]: FirebaseFunctions };

export type FirebaseFunctionsRunnable = (functions.HttpsFunction & functions.Runnable<unknown>) | { [key: string]: FirebaseFunctionsRunnable };

export function createFirebaseFunctions(
    creator: FirebaseFunctions,
    getCryptionKeys: (databaseType: DatabaseType) => Crypter.Keys,
    getCallSecretKey: (databaseType: DatabaseType) => string
): FirebaseFunctionsRunnable {
    if (typeof creator === 'function')
        return FirebaseFunction.create(creator, getCryptionKeys, getCallSecretKey);
    const firebaseFunctions: Record<string, FirebaseFunctionsRunnable> = {};
    for (const entry of Object.entries(creator))
        firebaseFunctions[entry[0]] = createFirebaseFunctions(entry[1], getCryptionKeys, getCallSecretKey);
    return firebaseFunctions;
}
