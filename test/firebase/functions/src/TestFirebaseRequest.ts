/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable require-jsdoc */
import {FirebaseRequest, GuardParameterBuilder, ILogger, IParameterContainer, ParameterParser, ValueParameterBuilder} from "firebase-function";
import {Parameters, TestReturnType} from "./TestFirebaseFunction";

export class TestFirebaseRequest implements FirebaseRequest<Parameters, Parameters, TestReturnType> {
  public parameters: Parameters;

  public constructor(parameterContainer: IParameterContainer, logger: ILogger) {
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
