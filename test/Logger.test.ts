import { expect } from 'chai';
import { Logger, VerboseType } from '../src';

describe('Logger', () => {
    const logger = Logger.start(new VerboseType('none'), 'f1', { v1: 'v1', v2: false }, 'notice');
    logger.nextIndent.log('f2', { v1: 3.14, v2: [0, 1, 2] });
    logger.log('f3', undefined, 'debug');
    const loggerN1 = logger.nextIndent;
    loggerN1.log('f4', { v1: { s1: 's1', s2: {} } }, 'info');
    const same = { same: null as unknown };
    same.same = same;
    loggerN1.log('f5', { v1: same });
    loggerN1.nextIndent.log('f6', { v1: true });

    it('verbose: none', () => {
        logger.verbose = new VerboseType('none');
        const expectedLog =
`> [f1]
|   > [f2]
> [f3]
|   > [f4]
|   > [f5]
|   |   > [f6]
`;
        expect(logger.completeLog).to.be.equal(expectedLog);
    });

    it('verbose: verbose', () => {
        logger.verbose = new VerboseType('verbose');
        const expectedLog =
`> [f1]: {
|     v1: 'v1'
|     v2: false
| }
|   > [f2]: {
|   |     v1: 3.14
|   |     v2: [ 0, 1, 2 ]
|   | }
> [f3]: {
| }
|   > [f4]: {
|   |     v1: { s1: 's1', s2: {} }
|   | }
|   > [f5]: {
|   |     v1: <ref *1> { same: [Circular *1] }
|   | }
|   |   > [f6]: {
|   |   |     v1: true
|   |   | }
`;
        expect(logger.completeLog).to.be.equal(expectedLog);
    });

    it('verbose: colored', () => {
        logger.verbose = new VerboseType('colored');
        const expectedLog =
`> \x1b[34m[f1]\x1b[0m
|   > \x1b[33m[f2]\x1b[0m
> \x1b[33m[f3]\x1b[0m
|   > \x1b[31m[f4]\x1b[0m
|   > \x1b[33m[f5]\x1b[0m
|   |   > \x1b[33m[f6]\x1b[0m
`;
        expect(logger.completeLog).to.be.equal(expectedLog);
    });

    it('verbose: coloredVerbose', () => {
        logger.verbose = new VerboseType('coloredVerbose');
        const expectedLog =
`> \x1b[34m[f1]\x1b[0m: {
|     v1: \x1b[2m'v1'\x1b[0m
|     v2: \x1b[2mfalse\x1b[0m
| }
|   > \x1b[33m[f2]\x1b[0m: {
|   |     v1: \x1b[2m3.14\x1b[0m
|   |     v2: \x1b[2m[ 0, 1, 2 ]\x1b[0m
|   | }
> \x1b[33m[f3]\x1b[0m: {
| }
|   > \x1b[31m[f4]\x1b[0m: {
|   |     v1: \x1b[2m{ s1: 's1', s2: {} }\x1b[0m
|   | }
|   > \x1b[33m[f5]\x1b[0m: {
|   |     v1: \x1b[2m<ref *1> { same: [Circular *1] }\x1b[0m
|   | }
|   |   > \x1b[33m[f6]\x1b[0m: {
|   |   |     v1: \x1b[2mtrue\x1b[0m
|   |   | }
`;
        expect(logger.completeLog).to.be.equal(expectedLog);
    });
});
