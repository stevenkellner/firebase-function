import type * as functions from 'firebase-functions';
import { FirebaseFunction, type FirebaseFunctionConstructor } from './FirebaseFunction';
import { FirebaseSchedule, type FirebaseScheduleConstructor } from './FirebaseSchedule';
import { FirebaseRequest, type FirebaseRequestConstructor } from './FirebaseRequest';
import { mapRecord } from '../utils';

export class FirebaseFunctionConstructorWrapper<Parameters, FlattenParameters, ReturnType> {

    public constructor(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public readonly Constructor: FirebaseFunctionConstructor<Parameters, FlattenParameters, ReturnType>
    ) {}
}

export class FirebaseScheduleConstructorWrapper {

    public constructor(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public readonly Constructor: FirebaseScheduleConstructor,
        public readonly schedule: string,
        public readonly timezone: string
    ) {}
}

export class FirebaseRequestConstructorWrapper<Parameters, FlattenParameters, ReturnType> {

    public constructor(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public readonly Constructor: FirebaseRequestConstructor<Parameters, FlattenParameters, ReturnType>
    ) {}
}

export type FirebaseFunctions =
    | FirebaseFunctionConstructorWrapper<unknown, unknown, unknown>
    | FirebaseScheduleConstructorWrapper
    | FirebaseRequestConstructorWrapper<unknown, unknown, unknown>
    | { [key: string]: FirebaseFunctions };

export namespace FirebaseFunctions {

    export type IsFunction<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunctionConstructorWrapper<unknown, unknown, unknown> ? true :
            Functions extends FirebaseScheduleConstructorWrapper ? false :
                Functions extends FirebaseRequestConstructorWrapper<unknown, unknown, unknown> ? false :
                    false;

    export type IsSchedule<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunctionConstructorWrapper<unknown, unknown, unknown> ? false :
            Functions extends FirebaseScheduleConstructorWrapper ? true :
                Functions extends FirebaseRequestConstructorWrapper<unknown, unknown, unknown> ? false :
                    false;

    export type IsRequest<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunctionConstructorWrapper<unknown, unknown, unknown> ? false :
            Functions extends FirebaseScheduleConstructorWrapper ? false :
                Functions extends FirebaseRequestConstructorWrapper<unknown, unknown, unknown> ? true :
                    false;

    export type IsRecord<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunctionConstructorWrapper<unknown, unknown, unknown> ? false :
            Functions extends FirebaseScheduleConstructorWrapper ? false :
                Functions extends FirebaseRequestConstructorWrapper<unknown, unknown, unknown> ? false :
                    true;

    export type FunctionParameters<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunctionConstructorWrapper<infer Parameters, unknown, unknown> ? Parameters :
            Functions extends FirebaseScheduleConstructorWrapper ? never :
                Functions extends FirebaseRequestConstructorWrapper<unknown, unknown, unknown> ? never :
                    never;

    export type FunctionFlattenParameters<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunctionConstructorWrapper<unknown, infer FlattenParameters, unknown> ? FlattenParameters :
            Functions extends FirebaseScheduleConstructorWrapper ? never :
                Functions extends FirebaseRequestConstructorWrapper<unknown, unknown, unknown> ? never :
                    never;

    export type FunctionReturnType<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunctionConstructorWrapper<unknown, unknown, infer ReturnType> ? ReturnType :
            Functions extends FirebaseScheduleConstructorWrapper ? never :
                Functions extends FirebaseRequestConstructorWrapper<unknown, unknown, unknown> ? never :
                    never;

    export type RequestParameters<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunctionConstructorWrapper<unknown, unknown, unknown> ? never :
            Functions extends FirebaseScheduleConstructorWrapper ? never :
                Functions extends FirebaseRequestConstructorWrapper<infer Parameters, unknown, unknown> ? Parameters :
                    never;

    export type RequestFlattenParameters<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunctionConstructorWrapper<unknown, unknown, unknown> ? never :
            Functions extends FirebaseScheduleConstructorWrapper ? never :
                Functions extends FirebaseRequestConstructorWrapper<unknown, infer FlattenParameters, unknown> ? FlattenParameters :
                    never;

    export type RequestReturnType<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunctionConstructorWrapper<unknown, unknown, unknown> ? never :
            Functions extends FirebaseScheduleConstructorWrapper ? never :
                Functions extends FirebaseRequestConstructorWrapper<unknown, unknown, infer ReturnType> ? ReturnType :
                    never;
}

export type RunnableFirebaseFunctions =
    | (functions.HttpsFunction & functions.Runnable<unknown>)
    | functions.CloudFunction<unknown>
    | functions.HttpsFunction
    | { [key: string]: RunnableFirebaseFunctions };

export class FirebaseFunctionBuilder {

    public function<Parameters, FlattenParameters, ReturnType>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Constructor: FirebaseFunctionConstructor<Parameters, FlattenParameters, ReturnType>
    ): FirebaseFunctionConstructorWrapper<Parameters, FlattenParameters, ReturnType> {
        return new FirebaseFunctionConstructorWrapper<Parameters, FlattenParameters, ReturnType>(Constructor);
    }

    public schedule(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Constructor: FirebaseScheduleConstructor,
        schedule: string,
        timezone: string
    ): FirebaseScheduleConstructorWrapper {
        return new FirebaseScheduleConstructorWrapper(Constructor, schedule, timezone);
    }

    public request<Parameters, FlattenParameters, ReturnType>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Constructor: FirebaseRequestConstructor<Parameters, FlattenParameters, ReturnType>
    ): FirebaseRequestConstructorWrapper<Parameters, FlattenParameters, ReturnType> {
        return new FirebaseRequestConstructorWrapper<Parameters, FlattenParameters, ReturnType>(Constructor);
    }
}

export function createFirebaseFunctions<Functions extends FirebaseFunctions>(
    create: (builder: FirebaseFunctionBuilder) => Functions
): Functions {
    const builder = new FirebaseFunctionBuilder();
    return create(builder);
}

export function provideFirebaseFunctions(
    firebaseFunctions: FirebaseFunctions,
    macKey: Uint8Array,
    regions: string[] = []
): RunnableFirebaseFunctions {
    if (firebaseFunctions instanceof FirebaseFunctionConstructorWrapper)
        return FirebaseFunction.create(firebaseFunctions.Constructor, macKey, regions);
    if (firebaseFunctions instanceof FirebaseScheduleConstructorWrapper)
        return FirebaseSchedule.create(firebaseFunctions.Constructor, firebaseFunctions.schedule, firebaseFunctions.timezone, regions);
    if (firebaseFunctions instanceof FirebaseRequestConstructorWrapper)
        return FirebaseRequest.create(firebaseFunctions.Constructor, macKey, regions);
    return mapRecord(firebaseFunctions, firebaseFunctions => provideFirebaseFunctions(firebaseFunctions, macKey, regions));
}
