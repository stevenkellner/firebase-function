import { ArrayTypeBuilder, Flattable, ObjectTypeBuilder, ValueTypeBuilder } from "@stevenkellner/typescript-common-functionality";
import { FirebaseRequest } from "../../../../lib/admin";
import { SubParameter, TestParameters } from "./Parameters";
import { TestReturnType } from "./ReturnType";

export class TestFirebaseRequest extends FirebaseRequest<TestParameters, TestReturnType> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<TestParameters>, TestParameters>({
        v1: new ValueTypeBuilder(),
        v2: new ArrayTypeBuilder(new ValueTypeBuilder()),
        v3: SubParameter.typeBuilder,
    });

    public constructor() {
        super();
        this.logger.notice("TestFirebaseFunction.constructor");
    }

    public async execute(parameters: TestParameters): Promise<TestReturnType> {
        return new TestReturnType(parameters.v3.v1 + " " + parameters.v1, parameters.v2.reduce((a, b) => a + b, 0));
    }
}
