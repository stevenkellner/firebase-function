import { Guid } from '../../src/utils/Guid';
import { expect } from '../../testSrc';

describe('Guid', () => {

    it('generate new and from string', () => {
        const guid = Guid.generate();
        const guidFromString = Guid.from(guid.guidString);
        expect(guidFromString).to.be.deep.equal(guid);
        expect(Guid.from('6c64b942-a0f9-4882-9af7-439c949c7a0a').guidString).to.be.equal('6c64b942-a0f9-4882-9af7-439c949c7a0a');
        expect(Guid.from('17A41DC7-968D-40E0-B386-52D3429733B0').guidString).to.be.equal('17a41dc7-968d-40e0-b386-52d3429733b0');
    });

    it('invalid guid string', () => {
        expect(() => Guid.from('')).to.throw();
        expect(() => Guid.from('db41ae9d-1164-6890-baf6-de4f9b743e05')).to.throw();
        expect(() => Guid.from('gbdb511a-1bd9-4f72-aba4-8a52b35895bd')).to.throw();
    });
});
