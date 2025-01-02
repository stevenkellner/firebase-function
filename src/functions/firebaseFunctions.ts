import { FirebaseFunction } from './FirebaseFunction';
import { FirebaseSchedule } from './FirebaseSchedule';
import { FirebaseRequest } from './FirebaseRequest';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import { mapRecord } from '@stevenkellner/typescript-common-functionality';
import type { Functions } from 'firebase/functions';
import type * as functions from 'firebase-functions';
import type { CallableFunction, HttpsFunction } from 'firebase-functions/v2/https';

export class AdminAndClientFunctionCreator<Parameters, ReturnType> {

    public constructor(
        private readonly Constructor: FirebaseFunction.Constructor<Parameters, ReturnType>
    ) {}

    public createAdmin(macKey: Uint8Array): FirebaseFunction.AdminFunction<Parameters, ReturnType> {
        return new FirebaseFunction.AdminFunction(this.Constructor, macKey);
    }

    public createClient(macKey: Uint8Array, functions: Functions, name: string): FirebaseFunction.ClientFunction<Parameters, ReturnType> {
        if (name === '')
            throw new Error('Client functions must have a name');
        return new FirebaseFunction.ClientFunction(this.Constructor, macKey, functions, name);
    }
}

export class AdminAndClientRequestCreator<Parameters, ReturnType> {

    public constructor(
        private readonly Constructor: FirebaseRequest.Constructor<Parameters, ReturnType>
    ) {}

    public createAdmin(macKey: Uint8Array): FirebaseRequest.AdminRequest<Parameters, ReturnType> {
        return new FirebaseRequest.AdminRequest(this.Constructor, macKey);
    }

    public createClient(macKey: Uint8Array, baseUrl: string, region: SupportedRegion, name: string): FirebaseRequest.ClientRequest<Parameters, ReturnType> {
        if (name === '')
            throw new Error('Client requests must have a name');
        return new FirebaseRequest.ClientRequest(this.Constructor, macKey, baseUrl, region, name);
    }
}

export class AdminScheduleCreator {

    public constructor(
        private readonly Constructor: FirebaseSchedule.Constructor,
        private readonly schedule: string,
        private readonly timezone: string
    ) {}

    public createAdmin(): FirebaseSchedule.AdminSchedule {
        return new FirebaseSchedule.AdminSchedule(this.Constructor, this.schedule, this.timezone);
    }
}

export class FirebaseFunctionBuilder {

    public function<Parameters, ReturnType>(
        Constructor: FirebaseFunction.Constructor<Parameters, ReturnType>
    ): AdminAndClientFunctionCreator<Parameters, ReturnType> {
        return new AdminAndClientFunctionCreator(Constructor);
    }

    public request<Parameters, ReturnType>(
        Constructor: FirebaseRequest.Constructor<Parameters, ReturnType>
    ): AdminAndClientRequestCreator<Parameters, ReturnType> {
        return new AdminAndClientRequestCreator(Constructor);
    }

    public schedule(
        Constructor: FirebaseSchedule.Constructor,
        schedule: string,
        timezone: string
    ): AdminScheduleCreator {
        return new AdminScheduleCreator(Constructor, schedule, timezone);
    }
}

export type FirebaseFunctionCreators =
    | AdminAndClientFunctionCreator<any, any>
    | AdminAndClientRequestCreator<any, any>
    | AdminScheduleCreator
    | { [key: string]: FirebaseFunctionCreators };

export function createFirebaseFunctionCreators<Creators extends FirebaseFunctionCreators>(
    create: (builder: FirebaseFunctionBuilder) => Creators
): Creators {
    const builder = new FirebaseFunctionBuilder();
    return create(builder);
}

export type RunnableFirebaseFunctions =
    | CallableFunction<any, any>
    | HttpsFunction
    | functions.scheduler.ScheduleFunction
    | { [key: string]: RunnableFirebaseFunctions };

export function provideFirebaseFunctions(
    creators: FirebaseFunctionCreators,
    macKey: Uint8Array,
    regions: SupportedRegion[] = []
): RunnableFirebaseFunctions {
    if (creators instanceof AdminAndClientFunctionCreator)
        return creators.createAdmin(macKey).runnable(regions);
    if (creators instanceof AdminAndClientRequestCreator)
        return creators.createAdmin(macKey).runnable(regions);
    if (creators instanceof AdminScheduleCreator)
        return creators.createAdmin().runnable(regions.length !== 0 ? regions[0] : null);
    return mapRecord(creators, creator => provideFirebaseFunctions(creator, macKey, regions));
}

export type ClientFirebaseFunctions<Creators extends FirebaseFunctionCreators> =
    Creators extends AdminAndClientFunctionCreator<infer Parameters, infer ReturnType> ? FirebaseFunction.ClientFunction<Parameters, ReturnType> :
        Creators extends AdminAndClientRequestCreator<infer Parameters, infer ReturnType> ? FirebaseRequest.ClientRequest<Parameters, ReturnType> :
            Creators extends AdminScheduleCreator ? null :
                Creators extends { [key: string]: FirebaseFunctionCreators } ? { [Key in keyof Creators]: ClientFirebaseFunctions<Creators[Key]> } : never;

export function createClientFirebaseFunctions<Creators extends FirebaseFunctionCreators>(
    creators: Creators,
    firebaseFunctions: Functions,
    requestBaseUrl: string,
    region: SupportedRegion,
    macKey: Uint8Array,
    name: string = ''
): ClientFirebaseFunctions<Creators> {
    if (creators instanceof AdminAndClientFunctionCreator)
        return creators.createClient(macKey, firebaseFunctions, name) as ClientFirebaseFunctions<Creators>;
    if (creators instanceof AdminAndClientRequestCreator)
        return creators.createClient(macKey, requestBaseUrl, region, name) as ClientFirebaseFunctions<Creators>;
    if (creators instanceof AdminScheduleCreator)
        return null as ClientFirebaseFunctions<Creators>;
    return mapRecord(creators as Record<string, FirebaseFunctionCreators>, (creator, key) => createClientFirebaseFunctions(creator, firebaseFunctions, requestBaseUrl, region, macKey, name === '' ? key : `${name}-${key}`)) as ClientFirebaseFunctions<Creators>;
}
