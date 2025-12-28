import type { FirebaseFunction } from './FirebaseFunction';
import type { FirebaseFunctionsContext } from './FirebaseFunctionsContext';
import type { FirebaseRequest } from './FirebaseRequest';
import type { FirebaseSchedule } from './FirebaseSchedule';

export class FirebaseFunctionExecutableContext<Parameters, ReturnType> {

    public constructor(
        public readonly Constructor: FirebaseFunction.ExecutableConstructor<Parameters, ReturnType>
    ) {}
}

export class FirebaseRequestExecutableContext<Parameters, ReturnType> {

    public constructor(
        public readonly Constructor: FirebaseRequest.ExecutableConstructor<Parameters, ReturnType>
    ) {}
}

export class FirebaseScheduleExecutableContext {

    public constructor(
        public readonly Constructor: FirebaseSchedule.ExecutableConstructor,
        public readonly schedule: string,
        public readonly timezone: string
    ) {}
}

export type FirebaseFunctionsExecutableContext<Context extends FirebaseFunctionsContext> =
    Context extends FirebaseFunction.ExecutableConstructor<infer Parameters, infer ReturnType> ? FirebaseFunctionExecutableContext<Parameters, ReturnType>
        : Context extends FirebaseRequest.ExecutableConstructor<infer Parameters, infer ReturnType> ? FirebaseRequestExecutableContext<Parameters, ReturnType>
            : Context extends FirebaseSchedule.ExecutableConstructor ? FirebaseScheduleExecutableContext
                : Context extends Record<any, any> ? { [Key in keyof Context]: FirebaseFunctionsExecutableContext<Context[Key]>; } : never;

export namespace FirebaseFunctionsExecutableContext {

    export class Builder {

        public function<Parameters, ReturnType>(
            Constructor: FirebaseFunction.ExecutableConstructor<Parameters, ReturnType>
        ): FirebaseFunctionExecutableContext<Parameters, ReturnType> {
            return new FirebaseFunctionExecutableContext(Constructor);
        }

        public request<Parameters, ReturnType>(
            Constructor: FirebaseRequest.ExecutableConstructor<Parameters, ReturnType>
        ): FirebaseRequestExecutableContext<Parameters, ReturnType> {
            return new FirebaseRequestExecutableContext(Constructor);
        }

        public schedule(
            Constructor: FirebaseSchedule.ExecutableConstructor,
            schedule: string,
            timezone: string
        ): FirebaseScheduleExecutableContext {
            return new FirebaseScheduleExecutableContext(Constructor, schedule, timezone);
        }
    }

    export function build<Context extends FirebaseFunctionsContext>(
        create: (builder: Builder) => FirebaseFunctionsExecutableContext<Context>
    ): FirebaseFunctionsExecutableContext<Context> {
        return create(new Builder());
    }
}
