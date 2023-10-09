export class PseudoRandom {
    private readonly initialMash = 0xefc8249d;

    private readonly state: {
        state0: number;
        state1: number;
        state2: number;
        constant: number;
    };

    public constructor(seed: Uint8Array) {
        let value = this.initialMash;
        let state0 = this.mashResult(value = this.mash(Uint8Array.from([32]), value));
        let state1 = this.mashResult(value = this.mash(Uint8Array.from([32]), value));
        let state2 = this.mashResult(value = this.mash(Uint8Array.from([32]), value));
        state0 -= this.mashResult(value = this.mash(seed, value));
        if (state0 < 0)
            state0 += 1;
        state1 -= this.mashResult(value = this.mash(seed, value));
        if (state1 < 0)
            state1 += 1;
        state2 -= this.mashResult(value = this.mash(seed, value));
        if (state2 < 0)
            state2 += 1;
        this.state = { state0: state0, state1: state1, state2: state2, constant: 1 };
    }

    public randomByte(): number {
        return Math.floor(this.random() * 256);
    }

    private mash(data: Uint8Array, value: number): number {
        for (const byte of data) {
            // eslint-disable-next-line no-param-reassign
            value += byte;
            let temp = 0.02519603282416938 * value;
            // eslint-disable-next-line no-param-reassign
            value = Math.trunc(temp);
            temp -= value;
            temp *= value;
            // eslint-disable-next-line no-param-reassign
            value = Math.trunc(temp);
            temp -= value;
            // eslint-disable-next-line no-param-reassign
            value += temp * 0x100000000;
        }
        return value;
    }

    private mashResult(value: number): number {
        return Math.trunc(value) * 2.3283064365386963e-10;
    }

    private random(): number {
        const value = 2091639 * this.state.state0 + this.state.constant * 2.3283064365386963e-10;
        this.state.state0 = this.state.state1;
        this.state.state1 = this.state.state2;
        this.state.constant = Math.trunc(value);
        this.state.state2 = value - this.state.constant;
        return this.state.state2;
    }
}
