import * as functions from 'firebase-functions';
import { ParameterContainer, type IParameterContainer } from '../parameter';
import type { AuthData } from 'firebase-functions/lib/common/providers/https';
import { Logger, type ILogger } from '../logger';
import { HMAC } from '../messageAuthenticator';
import { HexBytesCoder, Utf8BytesCoder } from '../bytesCoder';
import { mapRecord, Result } from '../utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface FirebaseFunction<Parameters, FlattenParameters, ReturnType> {

    parameters: Parameters;

    execute(): Promise<ReturnType>;
}

export type FirebaseFunctionConstructor<Parameters, FlattenParameters, ReturnType> = new (parameterContainer: IParameterContainer, auth: AuthData | null, logger: ILogger) => FirebaseFunction<Parameters, FlattenParameters, ReturnType>;

export namespace FirebaseFunction {

    export type ValidReturnType =
        | boolean
        | string
        | number
        | null
        | void
        | ValidReturnType[]
        | { [key: string]: ValidReturnType };

    export interface Flattable<Flatten extends FirebaseFunction.ValidReturnType> {

        flatten: Flatten;
    }

    export namespace Flattable {

        export function flatten(
            value: unknown
        ): ValidReturnType {
            if (typeof value === 'boolean' || typeof value === 'string' || typeof value === 'number' || value === null)
                return value;
            if (Array.isArray(value))
                return value.map(element => flatten(element));
            if (typeof value === 'object') {
                if ('flatten' in value)
                    return (value as Flattable<ValidReturnType>).flatten;
                return mapRecord(value as any, element => flatten(element));
            }
            return null;
        }
    }

    export function verifyMacTag(tag: string, parameters: unknown, key: Uint8Array): boolean {
        const messageAuthenticater = new HMAC(key);
        const macTagByteCoder = new HexBytesCoder();
        const rawMacTag = macTagByteCoder.encode(tag);
        const parametersBytesCoder = new Utf8BytesCoder();
        const encodedParameters = parametersBytesCoder.encode(JSON.stringify(parameters));
        return messageAuthenticater.verify(encodedParameters, rawMacTag);
    }

    function convertToHttpsError(error: unknown): functions.https.HttpsError {
        if (error instanceof functions.https.HttpsError)
            return error;
        return new functions.https.HttpsError('unknown', 'Unknown error occured', error);
    }

    export async function execute<T>(
        _function: () => Promise<T>
    ): Promise<Result<T, functions.https.HttpsError>> {
        try {
            return await _function()
                .then(value => Result.success(value))
                .catch(error => Result.failure(convertToHttpsError(error)));
        } catch (error) {
            return Result.failure(convertToHttpsError(error));
        }
    }

    export function create<Parameters, FlattenParameters, ReturnType>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        FirebaseFunction: FirebaseFunctionConstructor<Parameters, FlattenParameters, ReturnType>,
        macKey: Uint8Array,
        regions: string[] = []
    ): functions.HttpsFunction & functions.Runnable<unknown> {
        return functions.region(...regions).https.onCall(async (data: {
            verboseLogger?: boolean;
            macTag: string;
            parameters: Record<string, unknown>;
        }, context) => {
            const result = await execute(async () => {

                const verboseLogger = 'verboseLogger' in data && data.verboseLogger === true;
                const logger = Logger.start('FirebaseFunction.create', null, 'info', verboseLogger);

                const verified = verifyMacTag(data.macTag, data.parameters, macKey);
                if (!verified)
                    throw new functions.https.HttpsError('permission-denied', 'Invalid MAC tag');

                const parameterContainer = new ParameterContainer(data.parameters, logger.nextIndent);
                const firebaseFunction = new FirebaseFunction(parameterContainer, context.auth ?? null, logger.nextIndent);
                const returnValue = await firebaseFunction.execute();
                return Flattable.flatten(returnValue);
            });
            return result;
        });
    }
}
