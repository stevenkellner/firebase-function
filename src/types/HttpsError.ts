import * as functions from 'firebase-functions';
import { type ILogger } from '../logger';
import { type FirebaseError } from './FirebaseResult';

export function HttpsError(
    code: FirebaseError.Code,
    message: string,
    logger: ILogger
): functions.https.HttpsError {
    console.log(`HttpsError (${code}): ${message}`);
    return new functions.https.HttpsError(code, message, logger.completeLog);
}
