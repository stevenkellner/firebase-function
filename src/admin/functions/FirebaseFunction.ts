import type { CallableRequest } from 'firebase-functions/lib/common/providers/https';
import type { SupportedRegion } from 'firebase-functions/v2/options';
import { type CallableFunction, onCall } from 'firebase-functions/v2/https';
import { Flattable, Logger, type Flatten, type ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { catchErrorToResult } from './catchErrorToResult';
import { verifyMacTag } from './verifyMacTag';
import { FunctionsLogger } from '../logger';
import { FunctionsError } from '../../shared/functions/FunctionsError';

export abstract class FirebaseFunction<Parameters, ReturnType> {

    protected logger = new Logger(new FunctionsLogger());

    public abstract parametersBuilder: ITypeBuilder<Flatten<Parameters>, Parameters>;

    public abstract execute(parameters: Parameters): Promise<ReturnType>;
}

export namespace FirebaseFunction {

    export type Constructor<Parameters, ReturnType> = new (userId: string | null) => FirebaseFunction<Parameters, ReturnType>;

    export class ConstructorWrapper<Parameters, ReturnType> {

        public constructor(
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public readonly Constructor: FirebaseFunction.Constructor<Parameters, ReturnType>
        ) {}
    }

    export function create<Parameters, ReturnType>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        FirebaseFunction: FirebaseFunction.Constructor<Parameters, ReturnType>,
        macKey: Uint8Array,
        regions: SupportedRegion[] = []
    ): CallableFunction<any, any> {
        return onCall({ region: regions }, async (request: CallableRequest<{
            macTag: string;
            parameters: Flatten<Parameters>;
        }>) => {
            const result = await catchErrorToResult(async () => {

                const verified = verifyMacTag(request.data.macTag, request.data.parameters, macKey);
                if (!verified)
                    throw new FunctionsError('failed-precondition', 'Invalid MAC tag');

                const userId = request.auth !== undefined ? request.auth.uid : null;
                const firebaseFunction = new FirebaseFunction(userId);
                const parameters = firebaseFunction.parametersBuilder.build(request.data.parameters);
                return firebaseFunction.execute(parameters);
            });
            return Flattable.flatten(result);
        });
    }
}
