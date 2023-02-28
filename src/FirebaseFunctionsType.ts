import type * as functions from 'firebase-functions';
import { type Crypter } from './crypter';
import { type DatabaseType } from './DatabaseType';
import { type FirebaseFunctionType as _FirebaseFunctionType, FirebaseFunction } from './FirebaseFunction';
import { type FunctionType as _FunctionType } from './FunctionType';
import { type ValidReturnType } from './ValidReturnType';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type FirebaseFunctionDescriptor<__FirebaseFunctionType extends _FirebaseFunctionType<_FunctionType<unknown, ValidReturnType, unknown>>, __FunctionType extends _FunctionType<unknown, ValidReturnType, unknown>> = () => __FirebaseFunctionType;

export namespace FirebaseFunctionDescriptor {
    export type FirebaseFunctionType<T extends FirebaseFunctionDescriptor<_FirebaseFunctionType<_FunctionType<unknown, ValidReturnType, unknown>>, _FunctionType<unknown, ValidReturnType, unknown>>> = T extends FirebaseFunctionDescriptor<infer __FirebaseFunctionType, _FunctionType<unknown, ValidReturnType, unknown>> ? __FirebaseFunctionType : never;

    export type FunctionType<T extends FirebaseFunctionDescriptor<_FirebaseFunctionType<_FunctionType<unknown, ValidReturnType, unknown>>, _FunctionType<unknown, ValidReturnType, unknown>>> = T extends FirebaseFunctionDescriptor<_FirebaseFunctionType<_FunctionType<unknown, ValidReturnType, unknown>>, infer __FunctionType> ? __FunctionType : never;

    export function create<__FirebaseFunctionType extends _FirebaseFunctionType<_FunctionType<unknown, ValidReturnType, unknown>>, __FunctionType extends _FunctionType<unknown, ValidReturnType, unknown>>(firebaseFunctions: __FirebaseFunctionType): FirebaseFunctionDescriptor<__FirebaseFunctionType, __FunctionType> {
        return () => {
            return firebaseFunctions;
        };
    }
}

export type FirebaseFunctionsType = FirebaseFunctionDescriptor<_FirebaseFunctionType<_FunctionType<unknown, ValidReturnType, unknown>>, _FunctionType<unknown, ValidReturnType, unknown>> | { [key: string]: FirebaseFunctionsType };

export type FirebaseRunnableFunctions = (functions.HttpsFunction & functions.Runnable<unknown>) | { [key: string]: FirebaseRunnableFunctions };

export function createFirebaseFunctions(
    firebaseFunctions: FirebaseFunctionsType,
    getCryptionKeys: (databaseType: DatabaseType) => Crypter.Keys,
    getCallSecretKey: (databaseType: DatabaseType) => string
): FirebaseRunnableFunctions {
    if (typeof firebaseFunctions === 'function')
        return FirebaseFunction.create(firebaseFunctions(), getCryptionKeys, getCallSecretKey);
    const firebaseRunnableFunctions: Record<string, FirebaseRunnableFunctions> = {};
    for (const entry of Object.entries(firebaseFunctions))
        firebaseRunnableFunctions[entry[0]] = createFirebaseFunctions(entry[1], getCryptionKeys, getCallSecretKey);
    return firebaseRunnableFunctions;
}
