import type { FirebaseFunction, IFirebaseFunction } from './FirebaseFunction';
import type { FirebaseRequest, IFirebaseRequest } from './FirebaseRequest';

export type FirebaseFunctions =
    | IFirebaseFunction.ConstructorWrapper<unknown, unknown>
    | IFirebaseRequest.ConstructorWrapper<unknown, unknown>
    | { [key: string]: FirebaseFunctions };

export type RunnableFirebaseFunctions<Functions extends FirebaseFunctions> =
    FirebaseFunctions.IsFunction<Functions> extends true ? FirebaseFunction<FirebaseFunctions.FunctionParameters<Functions>, FirebaseFunctions.FunctionReturnType<Functions>> :
        FirebaseFunctions.IsRequest<Functions> extends true ? FirebaseRequest<FirebaseFunctions.RequestParameters<Functions>, FirebaseFunctions.RequestReturnType<Functions>> :
            Functions extends { [key: string]: FirebaseFunctions } ? { [Key in keyof Functions]: RunnableFirebaseFunctions<Functions[Key]> } : never;

export namespace FirebaseFunctions {

    export type IsFunction<Functions extends FirebaseFunctions> =
        Functions extends IFirebaseFunction.ConstructorWrapper<unknown, unknown> ? true :
            Functions extends IFirebaseRequest.ConstructorWrapper<unknown, unknown> ? false :
                false;

    export type IsRequest<Functions extends FirebaseFunctions> =
        Functions extends IFirebaseFunction.ConstructorWrapper<unknown, unknown> ? false :
            Functions extends IFirebaseRequest.ConstructorWrapper<unknown, unknown> ? true :
                false;

    export type IsRecord<Functions extends FirebaseFunctions> =
        Functions extends IFirebaseFunction.ConstructorWrapper<unknown, unknown> ? false :
            Functions extends IFirebaseRequest.ConstructorWrapper<unknown, unknown> ? false :
                true;

    export type FunctionParameters<Functions extends FirebaseFunctions> =
        Functions extends IFirebaseFunction.ConstructorWrapper<infer Parameters, unknown> ? Parameters :
            Functions extends IFirebaseRequest.ConstructorWrapper<unknown, unknown> ? never :
                never;

    export type FunctionReturnType<Functions extends FirebaseFunctions> =
        Functions extends IFirebaseFunction.ConstructorWrapper<unknown, infer ReturnType> ? ReturnType :
            Functions extends IFirebaseRequest.ConstructorWrapper<unknown, unknown> ? never :
                never;

    export type RequestParameters<Functions extends FirebaseFunctions> =
        Functions extends IFirebaseFunction.ConstructorWrapper<unknown, unknown> ? never :
            Functions extends IFirebaseRequest.ConstructorWrapper<infer Parameters, unknown> ? Parameters :
                never;

    export type RequestReturnType<Functions extends FirebaseFunctions> =
        Functions extends IFirebaseFunction.ConstructorWrapper<unknown, unknown> ? never :
            Functions extends IFirebaseRequest.ConstructorWrapper<unknown, infer ReturnType> ? ReturnType :
                never;
}
