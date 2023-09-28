import { type IFunctionType } from './types';
import { type FirebaseFunction } from './IFirebaseFunction';
import { type FirebaseRequest } from './IFirebaseRequest';
import { type FirebaseSchedule } from './IFirebaseSchedule';

export type FirebaseDescriptor =
    | FirebaseDescriptor.Function<IFunctionType.Erased, unknown>
    | FirebaseDescriptor.Request<IFunctionType.Erased>
    | FirebaseDescriptor.Schedule;

export namespace FirebaseDescriptor {
    export type Function<FunctionType extends IFunctionType.Erased, ResponseContext> = [FirebaseFunction.Constructor<FunctionType, ResponseContext>];

    export type Request<FunctionType extends IFunctionType.Erased> = [FirebaseRequest.Constructor<FunctionType>, void];

    export type Schedule = [FirebaseSchedule.Constructor, string, void];

    export function _function<FunctionType extends IFunctionType.Erased, ResponseContext = never>(
        firebaseFunction: FirebaseFunction.Constructor<FunctionType, ResponseContext>
    ): FirebaseDescriptor {
        return [firebaseFunction];
    }

    export function request<FunctionType extends IFunctionType.Erased>(
        firebaseRequest: FirebaseRequest.Constructor<FunctionType>
    ): FirebaseDescriptor {
        return [firebaseRequest, undefined];
    }

    export function schedule(
        schedule: string, firebaseSchedule: FirebaseSchedule.Constructor
    ): FirebaseDescriptor {
        return [firebaseSchedule, schedule, undefined];
    }
}
