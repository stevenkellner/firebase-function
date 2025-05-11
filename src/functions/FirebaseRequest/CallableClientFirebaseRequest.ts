import type { Result } from '@stevenkellner/typescript-common-functionality';
import { BaseClientFirebaseRequest } from './BaseClientFirebaseRequest';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import type { FunctionsError } from '../utils';
import * as axios from 'axios';
import type { FirebaseRequest } from './FirebaseRequest';

export class CallableClientFirebaseRequest<Parameters, ReturnType> extends BaseClientFirebaseRequest<Parameters, ReturnType> {

    public constructor(
        FirebaseRequest: FirebaseRequest.Constructor<Parameters, ReturnType>,
        macKey: Uint8Array,
        private readonly baseUrl: string,
        private readonly region: SupportedRegion,
        private readonly name: string
    ) {
        super(FirebaseRequest, macKey);
    }

    private get url(): string {
        return `${this.baseUrl}/${this.region}/${this.name}`;
    }

    public async executeWithResult(parameters: Parameters): Promise<Result<ReturnType, FunctionsError>> {
        const response = await axios.default.post<Result.Flatten<ReturnType, FunctionsError>>(this.url, this.parametersData(parameters));
        return this.result(response.data);
    }
}
