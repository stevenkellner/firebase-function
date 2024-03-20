import { Sha512HexEncoding } from '../../src';
import { expect } from '../testUtils';

describe('Sha512HexEncoding', () => {

    it('lowercased', () => {
        const hasher = new Sha512HexEncoding();
        expect(hasher.hash('')).to.be.equal('cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e');
        expect(hasher.hash('ksadhlömasc298089qwer')).to.be.equal('043db36e403e5b6c13ad8ca0ee3a1d5c81d51f5ee89879a9011a39b69281deabb531f17adf792d92204b6e9041f91124fe8006cab41457a93886bb7649f12acf');
        expect(hasher.hash('', 'Acgva')).to.be.equal('a5c76fa37dc4fd98932e34d7248b55944be8fe9101c16032f7bc66938dc98f6547288b8960ecc209061108c7a3922ab85fe4af1f2a1aac66e14d1239ff9d8af1');
        expect(hasher.hash('ksadhlömasc298089qwer', 'Acgva')).to.be.equal('c3aeaed2ee38f57cd635de3905aa7c7607a4505c2f6bb8a63cf21bbfba4111baa7203ba4cb3f6618040356efd9209d233b1b0d980fdb1a6d50eb91425d5d6746');
    });

    it('uppercased', () => {
        const hasher = new Sha512HexEncoding(true);
        expect(hasher.hash('')).to.be.equal('CF83E1357EEFB8BDF1542850D66D8007D620E4050B5715DC83F4A921D36CE9CE47D0D13C5D85F2B0FF8318D2877EEC2F63B931BD47417A81A538327AF927DA3E');
        expect(hasher.hash('ksadhlömasc298089qwer')).to.be.equal('043DB36E403E5B6C13AD8CA0EE3A1D5C81D51F5EE89879A9011A39B69281DEABB531F17ADF792D92204B6E9041F91124FE8006CAB41457A93886BB7649F12ACF');
        expect(hasher.hash('', 'Acgva')).to.be.equal('A5C76FA37DC4FD98932E34D7248B55944BE8FE9101C16032F7BC66938DC98F6547288B8960ECC209061108C7A3922AB85FE4AF1F2A1AAC66E14D1239FF9D8AF1');
        expect(hasher.hash('ksadhlömasc298089qwer', 'Acgva')).to.be.equal('C3AEAED2EE38F57CD635DE3905AA7C7607A4505C2F6BB8A63CF21BBFBA4111BAA7203BA4CB3F6618040356EFD9209D233B1B0D980FDB1A6D50EB91425D5D6746');
    });
});
