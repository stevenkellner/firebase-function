import { expect } from 'chai';
import { Greeter } from '../src';

describe('Greeter ', () => {
    it('greet world', () => {
        expect(Greeter('World')).to.be.equal('Hello World');
    });
});
