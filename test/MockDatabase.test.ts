import { MockDatabaseReference } from '../src/testUtils';
import { expect } from 'chai';

describe('MockDatabase', () => {
    it('test', async () => {
        const databaseScheme = MockDatabaseReference.createDatabaseScheme(encrypt => ({
            value1: 12,
            value2: 'asdf' as string | null,
            value3: encrypt(false as boolean),
            value4: {
                value5: 'a',
                value6: 'b',
                value7: 'c'
            }
        }));
        const databaseReference = new MockDatabaseReference(databaseScheme);
        expect((await databaseReference.snapshot()).child('value1').value()).to.be.equal(12);
        expect((await databaseReference.child('value2').snapshot()).value()).to.be.equal('asdf');
        expect((await databaseReference.snapshot()).child('value3').value('decrypt')).to.be.equal(false);
        expect((await databaseReference.child('value4').snapshot()).reduce('', (result, snapshot) => result + snapshot.value())).to.be.equal('abc');
        await databaseReference.child('value1').set(5);
        await databaseReference.child('value3').set(true, 'encrypt');
        await databaseReference.child('value2').remove();
        expect((await databaseReference.snapshot()).child('value1').value()).to.be.equal(5);
        expect((await databaseReference.snapshot()).child('value3').value('decrypt')).to.be.equal(true);
        expect((await databaseReference.child('value2').snapshot()).exists).to.be.false;
        await databaseReference.child('value4').set({ value5: 'x', value6: 'y', value7: 'z' });
        expect((await databaseReference.child('value4').snapshot()).reduce('', (result, snapshot) => result + snapshot.value())).to.be.equal('xyz');
        await databaseReference.remove();
        expect((await databaseReference.snapshot()).exists).to.be.false;
    });
});
