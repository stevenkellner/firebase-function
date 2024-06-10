/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable require-jsdoc */
import {Flattable, ITypeBuilder, TypeBuilder} from "firebase-function";

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
    return new TypeBuilder((value) => new SubParameter(value ? "a" : "b"));
  }

  public get flatten(): boolean {
    return this.v1 === "a";
  }
}

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
