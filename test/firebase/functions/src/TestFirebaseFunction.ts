/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable require-jsdoc */
import {AuthData} from "firebase-functions/lib/common/providers/tasks";
import {FirebaseFunction, GuardParameterBuilder, ILogger, IParameterContainer, ParameterParser, ValueParameterBuilder} from "firebase-function";

export type Parameters = {
    v1: string;
    v2: number;
    v3: "a" | "b"
}

export class TestReturnType implements FirebaseFunction.Flattable<{
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

export class TestFirebaseFunction implements FirebaseFunction<Parameters, Parameters, TestReturnType> {
  public parameters: Parameters;

  public constructor(parameterContainer: IParameterContainer, auth: AuthData | null, logger: ILogger) {
    logger.log("TestFirebaseFunction.constructor", null, "notice");
    const parameterParser = new ParameterParser<Parameters>({
      v1: new ValueParameterBuilder("string"),
      v2: new ValueParameterBuilder("number"),
      v3: new GuardParameterBuilder("string", (value): value is "a" | "b" => value === "a" || value === "b"),
    }, logger.nextIndent);
    this.parameters = parameterParser.parse(parameterContainer);
  }

  public async execute(): Promise<TestReturnType> {
    return new TestReturnType(this.parameters.v3 + " " + this.parameters.v1, this.parameters.v2);
  }
}
