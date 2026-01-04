import type { SupportedRegion } from 'firebase-functions/v2/options';
import type { onCall as firebaseOnCall, CallableFunction, CallableRequest } from 'firebase-functions/v2/https';
import { Flattable, type Result } from '@stevenkellner/typescript-common-functionality';
import type { FirebaseFunction } from './FirebaseFunction';
import { convertErrorToResult, FunctionsError, MacTag, UserAuthId } from '../utils';

export interface AuthData {
    uid: string;
    token: {
        aud: string;
        auth_time: number;
        email?: string;
        email_verified?: boolean;
        exp: number;
        firebase: {
            identities: {
                [key: string]: any;
            };
            sign_in_provider: string;
            sign_in_second_factor?: string;
            second_factor_identifier?: string;
            tenant?: string;
            [key: string]: any;
        };
        iat: number;
        iss: string;
        phone_number?: string;
        picture?: string;
        sub: string;
        uid: string;
        [key: string]: any;
    };
    rawToken: string;
}

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
        const userAuthId = auth !== undefined ? UserAuthId.builder.build(auth.uid) : null;
        const parameters = firebaseFunction.parametersBuilder.build(data.parameters);
        return firebaseFunction.execute(userAuthId, parameters);
    }

    public runnable(regions: SupportedRegion[]): CallableFunction<any, any> {
        return this.onCall({ region: regions }, async (request: CallableRequest<FirebaseFunction.ParametersData<Parameters>>) => {
            const result = await convertErrorToResult(async () => this.execute(request.auth, request.data));
            return Flattable.flatten(result);
        });
    }
}
