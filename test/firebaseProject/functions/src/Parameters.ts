import { Flattable, ITypeBuilder, TypeBuilder } from "@stevenkellner/typescript-common-functionality";

export type TestParameters = {
    v1: string;
    v2: number[];
    v3: SubParameter;
}

export class SubParameter implements Flattable<boolean> {

    public constructor(
        public readonly v1: "a" | "b"
    ) {}

    public static get typeBuilder(): ITypeBuilder<boolean, SubParameter> {
        return new TypeBuilder(value => new SubParameter(value ? "a" : "b"));
    }

    public get flatten(): boolean {
        return this.v1 === "a";
    }
}
