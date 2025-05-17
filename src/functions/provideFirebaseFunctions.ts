import { AdminFirebaseFunction } from './FirebaseFunction';
import { AdminFirebaseRequest } from './FirebaseRequest';
import { AdminFirebaseSchedule } from './FirebaseSchedule';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import { mapRecord } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunctionContext, FirebaseRequestContext, FirebaseScheduleContext, type FirebaseFunctionsContext } from './FirebaseFunctionsContext';
import type { onCall, onRequest } from 'firebase-functions/v2/https';
import type { onSchedule } from 'firebase-functions/v2/scheduler';

export type RunnableFirebaseFunctions =
    ReturnType<(AdminFirebaseFunction<any, any> | AdminFirebaseRequest<any, any> | AdminFirebaseSchedule)['runnable']>
    | { [key: string]: RunnableFirebaseFunctions };

export function provideFirebaseFunctions(
    context: FirebaseFunctionsContext,
    macKey: Uint8Array,
    firebaseHandlers: {
        onCall: typeof onCall;
        onRequest: typeof onRequest;
        onSchedule: typeof onSchedule;
    },
    regions: SupportedRegion[] = []
): RunnableFirebaseFunctions {
    if (context instanceof FirebaseFunctionContext)
        return new AdminFirebaseFunction(context.Constructor, macKey, firebaseHandlers.onCall).runnable(regions);
    if (context instanceof FirebaseRequestContext)
        return new AdminFirebaseRequest(context.Constructor, macKey, firebaseHandlers.onRequest).runnable(regions);
    if (context instanceof FirebaseScheduleContext)
        return new AdminFirebaseSchedule(context.Constructor, context.schedule, context.timezone, firebaseHandlers.onSchedule).runnable(regions.length !== 0 ? regions[0] : null);
    return mapRecord(context, creator => provideFirebaseFunctions(creator, macKey, firebaseHandlers, regions));
}
