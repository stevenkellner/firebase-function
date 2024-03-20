import { Sha512Base64Encoding } from '../../src';
import { expect } from '../../testSrc';

describe('Sha512Base64Encoding', () => {

    it('without padding', () => {
        const hasher = new Sha512Base64Encoding();
        expect(hasher.hash('')).to.be.equal('z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg');
        expect(hasher.hash('ksadhlömasc298089qwer')).to.be.equal('BD2zbkA+W2wTrYyg7jodXIHVH17omHmpARo5tpKB3qu1MfF633ktkiBLbpBB+REk/oAGyrQUV6k4hrt2SfEqzw');
        expect(hasher.hash('', 'Acgva')).to.be.equal('pcdvo33E/ZiTLjTXJItVlEvo/pEBwWAy97xmk43Jj2VHKIuJYOzCCQYRCMejkiq4X+SvHyoarGbhTRI5/52K8Q');
        expect(hasher.hash('ksadhlömasc298089qwer', 'Acgva')).to.be.equal('w66u0u449XzWNd45Bap8dgekUFwva7imPPIbv7pBEbqnIDukyz9mGAQDVu/ZIJ0jOxsNmA/bGm1Q65FCXV1nRg');
    });

    it('with padding', () => {
        const hasher = new Sha512Base64Encoding('=');
        expect(hasher.hash('')).to.be.equal('z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg==');
        expect(hasher.hash('ksadhlömasc298089qwer')).to.be.equal('BD2zbkA+W2wTrYyg7jodXIHVH17omHmpARo5tpKB3qu1MfF633ktkiBLbpBB+REk/oAGyrQUV6k4hrt2SfEqzw==');
        expect(hasher.hash('', 'Acgva')).to.be.equal('pcdvo33E/ZiTLjTXJItVlEvo/pEBwWAy97xmk43Jj2VHKIuJYOzCCQYRCMejkiq4X+SvHyoarGbhTRI5/52K8Q==');
        expect(hasher.hash('ksadhlömasc298089qwer', 'Acgva')).to.be.equal('w66u0u449XzWNd45Bap8dgekUFwva7imPPIbv7pBEbqnIDukyz9mGAQDVu/ZIJ0jOxsNmA/bGm1Q65FCXV1nRg==');
    });
});
