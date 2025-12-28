import type { AuthData } from './../../../node_modules/firebase-functions/lib/common/providers/https';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import type { onCall as firebaseOnCall, CallableFunction, CallableRequest } from 'firebase-functions/v2/https';
import { Flattable, type Result } from '@stevenkellner/typescript-common-functionality';
import type { FirebaseFunction } from './FirebaseFunction';
import { convertErrorToResult, FunctionsError, MacTag } from '../utils';

export class AdminFirebaseFunction<Parameters, ReturnType> {

    public constructor(
        private readonly FirebaseFunction: FirebaseFunction.ExecutableConstructor<Parameters, ReturnType>,
        private readonly macKey: Uint8Array,
        private readonly onCall: typeof firebaseOnCall<FirebaseFunction.ParametersData<Parameters>, Promise<Flattable.Flatten<Result<ReturnType, FunctionsError>>>>
    ) {}

    private async execute(auth: AuthData | undefined, data: FirebaseFunction.ParametersData<Parameters>): Promise<ReturnType> {
        const macTag = new MacTag(this.macKey);
        if (!macTag.verified(data.macTag, data.parameters))
            throw new FunctionsError('failed-precondition', 'Invalid MAC tag');

        const firebaseFunction = new this.FirebaseFunction();
        const userId = auth !== undefined ? auth.uid : null;
        const parameters = firebaseFunction.parametersBuilder.build(data.parameters);
        return firebaseFunction.execute(userId, parameters);
    }

    public runnable(regions: SupportedRegion[]): CallableFunction<any, any> {
        return this.onCall({ region: regions }, async (request: CallableRequest<FirebaseFunction.ParametersData<Parameters>>) => {
            const result = await convertErrorToResult(async () => this.execute(request.auth, request.data));
            return Flattable.flatten(result);
        });
    }
}
