/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable require-jsdoc */
import {ArrayTypeBuilder, FirebaseFunction, Flatten, ILogger, ObjectTypeBuilder, ValueTypeBuilder} from "firebase-function";
import {SubParameter, TestParameters, TestReturnType} from "./TestParametersAndReturnType";


export class TestFirebaseFunction implements FirebaseFunction<TestParameters, TestReturnType> {
  public parametersBuilder = new ObjectTypeBuilder<Flatten<TestParameters>, TestParameters>({
    v1: new ValueTypeBuilder(),
    v2: new ArrayTypeBuilder(new ValueTypeBuilder()),
    v3: SubParameter.typeBuilder,
  });

  public constructor(userId: string | null, logger: ILogger) {
    logger.log("TestFirebaseFunction.constructor", null, "notice");
  }

  public async execute(parameters: TestParameters): Promise<TestReturnType> {
    return new TestReturnType(parameters.v3.v1 + " " + parameters.v1, parameters.v2.reduce((a, b) => a + b, 0));
  }
}
