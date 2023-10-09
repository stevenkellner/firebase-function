import type { IDatabaseScheme } from './database';
import type { IFirebaseFunction } from './IFirebaseFunction';
import type { IFirebaseRequest } from './IFirebaseRequest';
import type { IFirebaseSchedule } from './IFirebaseSchedule';
import type { IFunctionType } from './types';

export type FirebaseDescriptor<DatabaseScheme extends IDatabaseScheme> =
    | FirebaseDescriptor.Function<IFunctionType.Erased, unknown, DatabaseScheme>
    | FirebaseDescriptor.Request<IFunctionType.Erased, DatabaseScheme>
    | FirebaseDescriptor.Schedule<DatabaseScheme>;

export namespace FirebaseDescriptor {
    export type Function<FunctionType extends IFunctionType.Erased, ResponseContext, DatabaseScheme extends IDatabaseScheme> = [IFirebaseFunction.Constructor<FunctionType, ResponseContext, DatabaseScheme>];

    export type Request<FunctionType extends IFunctionType.Erased, DatabaseScheme extends IDatabaseScheme> = [IFirebaseRequest.Constructor<FunctionType, DatabaseScheme>, null];

    export type Schedule<DatabaseScheme extends IDatabaseScheme> = [IFirebaseSchedule.Constructor<DatabaseScheme>, string, null];

    export function _function<FunctionType extends IFunctionType.Erased, ResponseContext = never, DatabaseScheme extends IDatabaseScheme = any>(
        firebaseFunction: IFirebaseFunction.Constructor<FunctionType, ResponseContext, DatabaseScheme>
    ): FirebaseDescriptor.Function<FunctionType, ResponseContext, DatabaseScheme> {
        return [firebaseFunction];
    }

    export function request<FunctionType extends IFunctionType.Erased, DatabaseScheme extends IDatabaseScheme = any>(
        firebaseRequest: IFirebaseRequest.Constructor<FunctionType, DatabaseScheme>
    ): FirebaseDescriptor.Request<FunctionType, DatabaseScheme> {
        return [firebaseRequest, null];
    }

    export function schedule<DatabaseScheme extends IDatabaseScheme = any>(
        schedule: string, firebaseSchedule: IFirebaseSchedule.Constructor<DatabaseScheme>
    ): FirebaseDescriptor.Schedule<DatabaseScheme> {
        return [firebaseSchedule, schedule, null];
    }
}
