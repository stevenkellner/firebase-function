import type { AuthData, CallableRequest } from 'firebase-functions/lib/common/providers/https';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import { type CallableFunction, onCall } from 'firebase-functions/v2/https';
import { Flattable, Result, type ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { MacTag } from './MacTag';
import { FunctionsError } from './FunctionsError';
import { type HttpsCallable, httpsCallable, type Functions } from 'firebase/functions';
import { convertErrorToResult } from './convertErrorToResult';

export abstract class FirebaseFunction<Parameters, ReturnType> {

    public abstract readonly parametersBuilder: ITypeBuilder<Flattable.Flatten<Parameters>, Parameters>;

    public abstract readonly returnTypeBuilder: ITypeBuilder<Flattable.Flatten<ReturnType>, ReturnType>;

    public userId: string | null = null;

    public abstract execute(parameters: Parameters): Promise<ReturnType>;
}

export namespace FirebaseFunction {

    export type Constructor<Parameters, ReturnType> = new () => FirebaseFunction<Parameters, ReturnType>;

    export type Parameters<Function extends FirebaseFunction<any, any> | Constructor<any, any>> =
        Function extends FirebaseFunction<infer Parameters, any> ? Parameters :
            Function extends Constructor<infer Parameters, any> ? Parameters : never;

    export type ReturnType<Function extends FirebaseFunction<any, any> | Constructor<any, any>> =
        Function extends FirebaseFunction<any, infer ReturnType> ? ReturnType :
            Function extends Constructor<any, infer ReturnType> ? ReturnType : never;

    type RawParameters<Parameters> = {
        macTag: string;
        parameters: Flattable.Flatten<Parameters>;
    };

    export class AdminFunction<Parameters, ReturnType> {

        public constructor(
            private readonly FirebaseFunction: FirebaseFunction.Constructor<Parameters, ReturnType>,
            private readonly macKey: Uint8Array
        ) {}

        private async execute(auth: AuthData | undefined, input: RawParameters<Parameters>): Promise<ReturnType> {
            const macTag = new MacTag(this.macKey);
            if (!macTag.verified(input.macTag, input.parameters))
                throw new FunctionsError('failed-precondition', 'Invalid MAC tag');

            const userId = auth !== undefined ? auth.uid : null;
            const firebaseFunction = new this.FirebaseFunction();
            firebaseFunction.userId = userId;
            const parameters = firebaseFunction.parametersBuilder.build(input.parameters);
            return firebaseFunction.execute(parameters);
        }

        public runnable(regions: SupportedRegion[]): CallableFunction<any, any> {
            return onCall({ region: regions }, async (request: CallableRequest<RawParameters<Parameters>>) => {
                const result = await convertErrorToResult(async () => this.execute(request.auth, request.data));
                return Flattable.flatten(result);
            });
        }
    }

    type FunctionCallable<Parameters, ReturnType> = HttpsCallable<RawParameters<Parameters>, Result.Flatten<ReturnType, FunctionsError>>;

    export class ClientFunction<Parameters, ReturnType> {

        public constructor(
            private readonly FirebaseFunction: FirebaseFunction.Constructor<Parameters, ReturnType>,
            private readonly macKey: Uint8Array,
            private readonly functions: Functions,
            private readonly name: string
        ) {}

        public async executeWithResult(parameters: Parameters): Promise<Result<ReturnType, FunctionsError>> {
            const firebaseFunction = new this.FirebaseFunction();
            const functionCallable: FunctionCallable<Parameters, ReturnType> = httpsCallable(this.functions, this.name);
            const flattenParameters = Flattable.flatten(parameters);
            const macTag = new MacTag(this.macKey);
            const flattenResult = await functionCallable({
                macTag: macTag.create(flattenParameters),
                parameters: flattenParameters
            });
            const resultBuilder = Result.builder(firebaseFunction.returnTypeBuilder, FunctionsError.builder);
            return resultBuilder.build(flattenResult.data);
        }

        public async execute(parameters: Parameters): Promise<ReturnType> {
            const result = await this.executeWithResult(parameters);
            return result.get();
        }
    }
}
