import * as functions from 'firebase-functions';
import type { ILogger } from '../logger';

export class HttpsError extends functions.https.HttpsError {

    public constructor(code: functions.https.FunctionsErrorCode, message: string, logger: ILogger) {
        super(code, message, logger.completeLog);
    }
}
