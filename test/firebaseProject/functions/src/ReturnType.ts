import { Flattable } from "@stevenkellner/typescript-common-functionality";

export class TestReturnType implements Flattable<{
    v1: string;
    v2: number;
}> {

    public constructor(
        public readonly v1_raw: string,
        public readonly v2_raw: number
    ) {}

    public get flatten(): { v1: string; v2: number; } {
        return {
            v1: this.v1_raw + " flattened",
            v2: this.v2_raw + 10,
        };
    }
}
