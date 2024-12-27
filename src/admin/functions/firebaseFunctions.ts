import { FirebaseFunction } from './FirebaseFunction';
import { FirebaseSchedule } from './FirebaseSchedule';
import { FirebaseRequest } from './FirebaseRequest';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import type { FirebaseFunctions, RunnableFirebaseFunctions } from './FirebaseFunctionsType';
import { mapRecord } from '@stevenkellner/typescript-common-functionality';

export class FirebaseFunctionBuilder {

    public function<Parameters, ReturnType>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Constructor: FirebaseFunction.Constructor<Parameters, ReturnType>
    ): FirebaseFunction.ConstructorWrapper<Parameters, ReturnType> {
        return new FirebaseFunction.ConstructorWrapper<Parameters, ReturnType>(Constructor);
    }

    public schedule(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Constructor: FirebaseSchedule.Constructor,
        schedule: string,
        timezone: string
    ): FirebaseSchedule.ConstructorWrapper {
        return new FirebaseSchedule.ConstructorWrapper(Constructor, schedule, timezone);
    }

    public request<Parameters, ReturnType>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Constructor: FirebaseRequest.Constructor<Parameters, ReturnType>
    ): FirebaseRequest.ConstructorWrapper<Parameters, ReturnType> {
        return new FirebaseRequest.ConstructorWrapper<Parameters, ReturnType>(Constructor);
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
    regions: SupportedRegion[] = []
): RunnableFirebaseFunctions {
    if (firebaseFunctions instanceof FirebaseFunction.ConstructorWrapper)
        return FirebaseFunction.create(firebaseFunctions.Constructor, macKey, regions);
    if (firebaseFunctions instanceof FirebaseSchedule.ConstructorWrapper)
        return FirebaseSchedule.create(firebaseFunctions.Constructor, firebaseFunctions.schedule, firebaseFunctions.timezone, regions.length !== 0 ? regions[0] : null);
    if (firebaseFunctions instanceof FirebaseRequest.ConstructorWrapper)
        return FirebaseRequest.create(firebaseFunctions.Constructor, macKey, regions);
    return mapRecord(firebaseFunctions, firebaseFunctions => provideFirebaseFunctions(firebaseFunctions, macKey, regions));
}
