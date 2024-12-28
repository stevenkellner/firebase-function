import { FirebaseFunction, IFirebaseFunction } from './FirebaseFunction';
import { FirebaseRequest, IFirebaseRequest } from './FirebaseRequest';
import type { FirebaseFunctions, RunnableFirebaseFunctions } from './FirebaseFunctionsType';
import { mapRecord } from '@stevenkellner/typescript-common-functionality';
import type { SupportedRegion } from 'firebase-functions/options';
import { type Functions as _Functions, getFunctions } from 'firebase/functions';

export class FirebaseFunctionBuilder {

    public function<Parameters, ReturnType>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Constructor: IFirebaseFunction.Constructor<Parameters, ReturnType>
    ): IFirebaseFunction.ConstructorWrapper<Parameters, ReturnType> {
        return new IFirebaseFunction.ConstructorWrapper<Parameters, ReturnType>(Constructor);
    }

    public request<Parameters, ReturnType>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Constructor: IFirebaseRequest.Constructor<Parameters, ReturnType>
    ): IFirebaseRequest.ConstructorWrapper<Parameters, ReturnType> {
        return new IFirebaseRequest.ConstructorWrapper<Parameters, ReturnType>(Constructor);
    }
}

export function createFirebaseFunctions<Functions extends FirebaseFunctions>(
    requestBaseUrl: string,
    region: SupportedRegion,
    macKey: Uint8Array,
    create: (builder: FirebaseFunctionBuilder) => Functions
): RunnableFirebaseFunctions<Functions> {
    const builder = new FirebaseFunctionBuilder();
    const firebaseFunctions = create(builder);
    const functions = getFunctions(undefined, region);
    return _create(functions, firebaseFunctions, requestBaseUrl, region, macKey, '');
}

export function _create<Functions extends FirebaseFunctions>(
    functions: _Functions,
    firebaseFunctions: Functions,
    requestBaseUrl: string,
    region: SupportedRegion,
    macKey: Uint8Array,
    name: string
): RunnableFirebaseFunctions<Functions> {
    if (firebaseFunctions instanceof IFirebaseFunction.ConstructorWrapper)
        return FirebaseFunction.create(firebaseFunctions.Constructor, functions, name, macKey) as RunnableFirebaseFunctions<Functions>;
    if (firebaseFunctions instanceof IFirebaseRequest.ConstructorWrapper)
        return FirebaseRequest.create(firebaseFunctions.Constructor, requestBaseUrl, region, name, macKey) as RunnableFirebaseFunctions<Functions>;
    return mapRecord(firebaseFunctions as Record<string, FirebaseFunctions>, (firebaseFunctions, key) => _create(functions, firebaseFunctions, requestBaseUrl, region, macKey, name === '' ? key : `${name}-${key}`)) as RunnableFirebaseFunctions<Functions>;
}
