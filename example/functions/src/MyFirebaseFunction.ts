import { ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunction } from '../../../src';
import { MySubParameter, type MyParameters } from './types/MyParameters';
import { MyReturnType } from './types/MyReturnType';

export class MyFirebaseFunction extends FirebaseFunction<MyParameters, MyReturnType> {

    public parametersBuilder = new ObjectTypeBuilder<MyParameters.Flatten, MyParameters>({
        v1: new ValueTypeBuilder(),
        v2: new ValueTypeBuilder(),
        v3: MySubParameter.typeBuilder
    });

    public returnTypeBuilder = MyReturnType.typeBuilder;

    // eslint-disable-next-line @typescript-eslint/require-await
    public async execute(parameters: MyParameters): Promise<MyReturnType> {
        return new MyReturnType(`${parameters.v3.v1} ${parameters.v1}`, parameters.v2.reduce((a, b) => a + b, 0));
    }
}
