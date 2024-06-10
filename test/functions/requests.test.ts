import { HexBytesCoder, HMAC, Result, Utf8BytesCoder } from '../../src';
import { expect } from '../../testSrc';
import * as axios from 'axios';

describe('functions', () => {

    function createMacTag(parameters: unknown, key: Uint8Array): string {
        const messageAuthenticater = new HMAC(key);
        const parametersBytesCoder = new Utf8BytesCoder();
        const encodedParameters = parametersBytesCoder.encode(JSON.stringify(parameters));
        const rawTag = messageAuthenticater.sign(encodedParameters);
        const macTagByteCoder = new HexBytesCoder();
        return macTagByteCoder.decode(rawTag);
    }

    it('call a firebase request', async () => {
        const parameters = {
            v1: 'c',
            v2: [0, 1, 2],
            v3: true
        };
        const result = Result.from((await axios.default.post('http://127.0.0.1:5001/fir-function-library/europe-west1/requests-request1', {
            macTag: createMacTag(parameters, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])),
            parameters: parameters
        })).data);
        expect(result).to.be.deep.equal(Result.success({
            v1: 'a c flattened',
            v2: 13
        }));
    });

    it('mac tag not verified', async () => {
        const parameters = {
            v1: 'c',
            v2: [0, 1, 2],
            v3: true
        };
        const result = Result.from((await axios.default.post('http://127.0.0.1:5001/fir-function-library/europe-west1/requests-request1', {
            macTag: '00ff',
            parameters: parameters
        })).data);
        expect(result.state).to.be.equal('failure');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect((result.error as any).status).to.be.equal('PERMISSION_DENIED');
    });
});
