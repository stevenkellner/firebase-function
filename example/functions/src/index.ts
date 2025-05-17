import { provideFirebaseFunctions } from '../../../src';
import { firebaseFunctionsContext } from './firebaseFunctionsContext';
import { onCall, onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';

const macKey = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
export = provideFirebaseFunctions(firebaseFunctionsContext, macKey, {
    onCall: onCall as any,
    onRequest: onRequest,
    onSchedule: onSchedule
}, ['europe-west1']);
