import { StringBuilder } from '../../src';
import { expect } from '../../src/testSrc';

describe('StringBuilder', () => {
    it('empty', () => {
        const builder = new StringBuilder();
        expect(builder.toString()).to.be.equal('');
    });

    it('append', () => {
        const builder = new StringBuilder();
        builder.append('asdf');
        builder.append('rgtr\n\tdov');
        builder.append(' d');
        expect(builder.toString()).to.be.equal('asdfrgtr\n\tdov d');
    });

    it('append line', () => {
        const builder = new StringBuilder();
        builder.append('asdf');
        builder.appendLine('rgtr\n\tdov');
        builder.appendLine(' d');
        expect(builder.toString()).to.be.equal('asdfrgtr\n\tdov\n d\n');
    });
});
