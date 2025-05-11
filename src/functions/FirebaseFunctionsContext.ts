import type { FirebaseFunction } from './FirebaseFunction';
import type { FirebaseRequest } from './FirebaseRequest';
import type { FirebaseSchedule } from './FirebaseSchedule';

export class FirebaseFunctionContext<Parameters, ReturnType> {

    public constructor(
        public readonly Constructor: FirebaseFunction.Constructor<Parameters, ReturnType>
    ) {}
}

export class FirebaseRequestContext<Parameters, ReturnType> {

    public constructor(
        public readonly Constructor: FirebaseRequest.Constructor<Parameters, ReturnType>
    ) {}
}

export class FirebaseScheduleContext {

    public constructor(
        public readonly Constructor: FirebaseSchedule.Constructor,
        public readonly schedule: string,
        public readonly timezone: string
    ) {}
}

export type FirebaseFunctionsContext =
    | FirebaseFunctionContext<any, any>
    | FirebaseRequestContext<any, any>
    | FirebaseScheduleContext
    | { [key: string]: FirebaseFunctionsContext };

export namespace FirebaseFunctionsContext {

    export class Builder {

        public function<Parameters, ReturnType>(
            Constructor: FirebaseFunction.Constructor<Parameters, ReturnType>
        ): FirebaseFunctionContext<Parameters, ReturnType> {
            return new FirebaseFunctionContext(Constructor);
        }

        public request<Parameters, ReturnType>(
            Constructor: FirebaseRequest.Constructor<Parameters, ReturnType>
        ): FirebaseRequestContext<Parameters, ReturnType> {
            return new FirebaseRequestContext(Constructor);
        }

        public schedule(
            Constructor: FirebaseSchedule.Constructor,
            schedule: string,
            timezone: string
        ): FirebaseScheduleContext {
            return new FirebaseScheduleContext(Constructor, schedule, timezone);
        }
    }

    export function build<Context extends FirebaseFunctionsContext>(
        create: (builder: Builder) => Context
    ): Context {
        return create(new Builder());
    }
}
