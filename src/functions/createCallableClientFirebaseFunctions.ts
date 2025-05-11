import type { Functions } from 'firebase/functions';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import { FirebaseFunctionContext, FirebaseRequestContext, FirebaseScheduleContext, type FirebaseFunctionsContext } from './FirebaseFunctionsContext';
import { CallableClientFirebaseFunction } from './FirebaseFunction';
import { CallableClientFirebaseRequest } from './FirebaseRequest';
import { mapRecord } from '@stevenkellner/typescript-common-functionality';

export type CallableClientFirebaseFunctions<Context extends FirebaseFunctionsContext> =
    Context extends FirebaseFunctionContext<infer Parameters, infer ReturnType> ? CallableClientFirebaseFunction<Parameters, ReturnType> :
        Context extends FirebaseRequestContext<infer Parameters, infer ReturnType> ? CallableClientFirebaseRequest<Parameters, ReturnType> :
            Context extends FirebaseScheduleContext ? null :
                Context extends { [key: string]: FirebaseFunctionsContext } ? { [Key in keyof Context]: CallableClientFirebaseFunctions<Context[Key]> } : never;

export function createCallableClientFirebaseFunctions<Context extends FirebaseFunctionsContext>(
    context: Context,
    functions: Functions,
    requestBaseUrl: string,
    region: SupportedRegion,
    macKey: Uint8Array,
    name: string = ''
): CallableClientFirebaseFunctions<Context> {
    if (context instanceof FirebaseFunctionContext)
        return new CallableClientFirebaseFunction(context.Constructor, macKey, functions, name) as CallableClientFirebaseFunctions<Context>;
    if (context instanceof FirebaseRequestContext)
        return new CallableClientFirebaseRequest(context.Constructor, macKey, requestBaseUrl, region, name) as CallableClientFirebaseFunctions<Context>;
    if (context instanceof FirebaseScheduleContext)
        return null as CallableClientFirebaseFunctions<Context>;
    return mapRecord(context as Record<string, FirebaseFunctionsContext>, (context, key) => createCallableClientFirebaseFunctions(context, functions, requestBaseUrl, region, macKey, name === '' ? key : `${name}-${key}`)) as CallableClientFirebaseFunctions<Context>;
}
