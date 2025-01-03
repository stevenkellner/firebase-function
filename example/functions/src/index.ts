import { provideFirebaseFunctions } from '../../../src';
import { firebaseFunctionCreators } from './firebaseFunctionCreators';

const macKey = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
export = provideFirebaseFunctions(firebaseFunctionCreators, macKey, ['europe-west1']);
