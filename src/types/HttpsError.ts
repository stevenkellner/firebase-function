import * as functions from 'firebase-functions';
import type { FirebaseError } from './FirebaseResult';
import type { ILogger } from '../logger';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function HttpsError(
    code: FirebaseError.Code,
    message: string,
    logger: ILogger
): functions.https.HttpsError {
    // eslint-disable-next-line no-console
    // console.log(`HttpsError (${code}): ${message}`);
    return new functions.https.HttpsError(code, message, logger.completeLog);
}
