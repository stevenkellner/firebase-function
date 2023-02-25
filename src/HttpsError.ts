import * as functions from 'firebase-functions';
import { type ILogger } from './logger';

export function HttpsError(
    code: functions.https.FunctionsErrorCode,
    message: string,
    logger: ILogger
): functions.https.HttpsError {
    return new functions.https.HttpsError(code, message, logger.completeLog);
}
