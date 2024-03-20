import { Utf8BytesCoder } from '../../src';
import { expect } from '../../testSrc';

describe('Utf8BytesCoder', () => {
    const bytesCoder = new Utf8BytesCoder();

    it('encode', () => {
        expect(bytesCoder.encode('1"Ǉǋ𮹃ذհM˰Ƌ𺏆Ĉ㴈󅿲5b񒨠ľ뾑㈅󧺟ӻ눕Yǋ𞉏兝 Hڹ')).to.be.deep.equal(new Uint8Array([238, 189, 142, 49, 34, 199, 135, 199, 139, 240, 174, 185, 131, 216, 176, 213, 176, 77, 203, 176, 198, 139, 240, 186, 143, 134, 196, 136, 227, 180, 136, 243, 133, 191, 178, 53, 98, 241, 146, 168, 160, 196, 190, 235, 190, 145, 227, 136, 133, 243, 167, 186, 159, 239, 154, 170, 211, 187, 235, 136, 149, 89, 199, 139, 240, 158, 137, 143, 229, 133, 157, 32, 72, 218, 185]));
        expect(bytesCoder.encode('ɒꪵ-`ގ轾O椘󳈆𜊱8ä숉ⲅ<釚¬˯򅇂ڸ`􋺭È󽡸ޖǻ:=Ӓ򋖞˷ꡩ󱕎ލ㖻ϻ󜅠̿𛅵񌷷k,.򴹈(ҍ鲜"דן')).to.be.deep.equal(new Uint8Array([201, 146, 234, 170, 181, 45, 96, 222, 142, 232, 189, 190, 79, 230, 164, 152, 243, 179, 136, 134, 240, 156, 138, 177, 56, 195, 164, 236, 136, 137, 226, 178, 133, 60, 233, 135, 154, 194, 172, 203, 175, 242, 133, 135, 130, 238, 158, 170, 194, 154, 218, 184, 96, 244, 139, 186, 173, 195, 136, 243, 189, 161, 184, 222, 150, 238, 147, 173, 199, 187, 58, 61, 211, 146, 242, 139, 150, 158, 203, 183, 238, 160, 139, 234, 161, 169, 243, 177, 149, 142, 222, 141, 227, 150, 187, 207, 187, 243, 156, 133, 160, 204, 191, 240, 155, 133, 181, 241, 140, 183, 183, 107, 44, 46, 242, 180, 185, 136, 40, 210, 141, 233, 178, 156, 34, 215, 147, 239, 142, 189, 215, 159]));
    });

    it('decode', () => {
        expect(bytesCoder.decode(new Uint8Array([238, 189, 142, 49, 34, 199, 135, 199, 139, 240, 174, 185, 131, 216, 176, 213, 176, 77, 203, 176, 198, 139, 240, 186, 143, 134, 196, 136, 227, 180, 136, 243, 133, 191, 178, 53, 98, 241, 146, 168, 160, 196, 190, 235, 190, 145, 227, 136, 133, 243, 167, 186, 159, 239, 154, 170, 211, 187, 235, 136, 149, 89, 199, 139, 240, 158, 137, 143, 229, 133, 157, 32, 72, 218, 185]))).to.be.deep.equal('1"Ǉǋ𮹃ذհM˰Ƌ𺏆Ĉ㴈󅿲5b񒨠ľ뾑㈅󧺟ӻ눕Yǋ𞉏兝 Hڹ');
        expect(bytesCoder.decode(new Uint8Array([201, 146, 234, 170, 181, 45, 96, 222, 142, 232, 189, 190, 79, 230, 164, 152, 243, 179, 136, 134, 240, 156, 138, 177, 56, 195, 164, 236, 136, 137, 226, 178, 133, 60, 233, 135, 154, 194, 172, 203, 175, 242, 133, 135, 130, 238, 158, 170, 194, 154, 218, 184, 96, 244, 139, 186, 173, 195, 136, 243, 189, 161, 184, 222, 150, 238, 147, 173, 199, 187, 58, 61, 211, 146, 242, 139, 150, 158, 203, 183, 238, 160, 139, 234, 161, 169, 243, 177, 149, 142, 222, 141, 227, 150, 187, 207, 187, 243, 156, 133, 160, 204, 191, 240, 155, 133, 181, 241, 140, 183, 183, 107, 44, 46, 242, 180, 185, 136, 40, 210, 141, 233, 178, 156, 34, 215, 147, 239, 142, 189, 215, 159]))).to.be.deep.equal('ɒꪵ-`ގ轾O椘󳈆𜊱8ä숉ⲅ<釚¬˯򅇂ڸ`􋺭È󽡸ޖǻ:=Ӓ򋖞˷ꡩ󱕎ލ㖻ϻ󜅠̿𛅵񌷷k,.򴹈(ҍ鲜"דן');
    });
});
