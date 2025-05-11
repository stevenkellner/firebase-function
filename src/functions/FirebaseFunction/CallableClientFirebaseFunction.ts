import type { Result } from '@stevenkellner/typescript-common-functionality';
import { BaseClientFirebaseFunction } from './BaseClientFirebaseFunction';
import type { FirebaseFunction } from './FirebaseFunction';
import { httpsCallable, type Functions } from 'firebase/functions';
import type { FunctionsError } from '../utils';

export class CallableClientFirebaseFunction<Parameters, ReturnType> extends BaseClientFirebaseFunction<Parameters, ReturnType> {

    public constructor(
        FirebaseFunction: FirebaseFunction.Constructor<Parameters, ReturnType>,
        macKey: Uint8Array,
        private readonly functions: Functions,
        private readonly name: string
    ) {
        super(FirebaseFunction, macKey);
    }

    public async executeWithResult(parameters: Parameters): Promise<Result<ReturnType, FunctionsError>> {
        const functionCallable = httpsCallable<FirebaseFunction.ParametersData<Parameters>, Result.Flatten<ReturnType, FunctionsError>>(this.functions, this.name);
        const httpsCallableResult = await functionCallable(this.parametersData(parameters));
        return this.result(httpsCallableResult.data);
    }
}
