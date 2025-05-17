import type { FirebaseRequest } from './FirebaseRequest';
import type { onRequest as firebaseOnRequest, HttpsFunction } from 'firebase-functions/v2/https';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import { convertErrorToResult, FunctionsError, MacTag } from '../utils';
import { Flattable } from '@stevenkellner/typescript-common-functionality';

export class AdminFirebaseRequest<Parameters, ReturnType> {

    public constructor(
        private readonly FirebaseRequest: FirebaseRequest.Constructor<Parameters, ReturnType>,
        private readonly macKey: Uint8Array,
        private readonly onRequest: typeof firebaseOnRequest
    ) {}

    private async execute(input: FirebaseRequest.ParametersData<Parameters>): Promise<ReturnType> {
        const macTag = new MacTag(this.macKey);
        if (!macTag.verified(input.macTag, input.parameters))
            throw new FunctionsError('failed-precondition', 'Invalid MAC tag');

        const firebaseRequest = new this.FirebaseRequest();
        const parameters = firebaseRequest.parametersBuilder.build(input.parameters);
        return firebaseRequest.execute(parameters);
    }

    public runnable(regions: SupportedRegion[]): HttpsFunction {
        return this.onRequest({ region: regions }, async (request, response) => {
            const result = await convertErrorToResult(async () => this.execute(request.body));
            const flattenResult = Flattable.flatten(result);
            response.send(flattenResult);
        });
    }
}
