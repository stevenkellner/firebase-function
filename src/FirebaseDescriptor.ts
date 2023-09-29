import { type IFunctionType } from './types';
import { type IFirebaseFunction } from './IFirebaseFunction';
import { type IFirebaseRequest } from './IFirebaseRequest';
import { type IFirebaseSchedule } from './IFirebaseSchedule';
import { type IDatabaseScheme } from './database';

export type FirebaseDescriptor<DatabaseScheme extends IDatabaseScheme> =
    | FirebaseDescriptor.Function<IFunctionType.Erased, unknown, DatabaseScheme>
    | FirebaseDescriptor.Request<IFunctionType.Erased, DatabaseScheme>
    | FirebaseDescriptor.Schedule<DatabaseScheme>;

export namespace FirebaseDescriptor {
    export type Function<FunctionType extends IFunctionType.Erased, ResponseContext, DatabaseScheme extends IDatabaseScheme> = [IFirebaseFunction.Constructor<FunctionType, ResponseContext, DatabaseScheme>];

    export type Request<FunctionType extends IFunctionType.Erased, DatabaseScheme extends IDatabaseScheme> = [IFirebaseRequest.Constructor<FunctionType, DatabaseScheme>, void];

    export type Schedule<DatabaseScheme extends IDatabaseScheme> = [IFirebaseSchedule.Constructor<DatabaseScheme>, string, void];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function _function<FunctionType extends IFunctionType.Erased, ResponseContext = never, DatabaseScheme extends IDatabaseScheme = any>(
        firebaseFunction: IFirebaseFunction.Constructor<FunctionType, ResponseContext, DatabaseScheme>
    ): FirebaseDescriptor.Function<FunctionType, ResponseContext, DatabaseScheme> {
        return [firebaseFunction];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function request<FunctionType extends IFunctionType.Erased, DatabaseScheme extends IDatabaseScheme = any>(
        firebaseRequest: IFirebaseRequest.Constructor<FunctionType, DatabaseScheme>
    ): FirebaseDescriptor.Request<FunctionType, DatabaseScheme> {
        return [firebaseRequest, undefined];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function schedule<DatabaseScheme extends IDatabaseScheme = any>(
        schedule: string, firebaseSchedule: IFirebaseSchedule.Constructor<DatabaseScheme>
    ): FirebaseDescriptor.Schedule<DatabaseScheme> {
        return [firebaseSchedule, schedule, undefined];
    }
}
