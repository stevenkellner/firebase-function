import type * as functions from 'firebase-functions';
import type { CallableFunction, HttpsFunction } from 'firebase-functions/v2/https';
import type { FirebaseFunction } from './FirebaseFunction';
import type { FirebaseRequest } from './FirebaseRequest';
import type { FirebaseSchedule } from './FirebaseSchedule';

export type FirebaseFunctions =
    | FirebaseFunction.ConstructorWrapper<unknown, unknown>
    | FirebaseRequest.ConstructorWrapper<unknown, unknown>
    | FirebaseSchedule.ConstructorWrapper
    | { [key: string]: FirebaseFunctions };

export type RunnableFirebaseFunctions =
    | CallableFunction<any, any>
    | HttpsFunction
    | functions.scheduler.ScheduleFunction
    | { [key: string]: RunnableFirebaseFunctions };

export namespace FirebaseFunctions {

    export type IsFunction<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunction.ConstructorWrapper<unknown, unknown> ? true :
            Functions extends FirebaseRequest.ConstructorWrapper<unknown, unknown> ? false :
                Functions extends FirebaseSchedule.ConstructorWrapper ? false :
                    false;

    export type IsRequest<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunction.ConstructorWrapper<unknown, unknown> ? false :
            Functions extends FirebaseRequest.ConstructorWrapper<unknown, unknown> ? true :
                Functions extends FirebaseSchedule.ConstructorWrapper ? false :
                    false;

    export type IsSchedule<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunction.ConstructorWrapper<unknown, unknown> ? false :
            Functions extends FirebaseRequest.ConstructorWrapper<unknown, unknown> ? false :
                Functions extends FirebaseSchedule.ConstructorWrapper ? true :
                    false;

    export type IsRecord<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunction.ConstructorWrapper<unknown, unknown> ? false :
            Functions extends FirebaseRequest.ConstructorWrapper<unknown, unknown> ? false :
                Functions extends FirebaseSchedule.ConstructorWrapper ? false :
                    true;

    export type FunctionParameters<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunction.ConstructorWrapper<infer Parameters, unknown> ? Parameters :
            Functions extends FirebaseRequest.ConstructorWrapper<unknown, unknown> ? never :
                Functions extends FirebaseSchedule.ConstructorWrapper ? never :
                    never;

    export type FunctionReturnType<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunction.ConstructorWrapper<unknown, infer ReturnType> ? ReturnType :
            Functions extends FirebaseRequest.ConstructorWrapper<unknown, unknown> ? never :
                Functions extends FirebaseSchedule.ConstructorWrapper ? never :
                    never;

    export type RequestParameters<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunction.ConstructorWrapper<unknown, unknown> ? never :
            Functions extends FirebaseRequest.ConstructorWrapper<infer Parameters, unknown> ? Parameters :
                Functions extends FirebaseSchedule.ConstructorWrapper ? never :
                    never;

    export type RequestReturnType<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunction.ConstructorWrapper<unknown, unknown> ? never :
            Functions extends FirebaseRequest.ConstructorWrapper<unknown, infer ReturnType> ? ReturnType :
                Functions extends FirebaseSchedule.ConstructorWrapper ? never :
                    never;
}
