import type { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';

export class MyReturnType implements Flattable<MyReturnType.Flatten> {

    public constructor(
        public readonly v1: string,
        public readonly v2: number
    ) {}

    public get flatten(): MyReturnType.Flatten {
        return {
            v1: this.v1,
            v2: this.v2
        };
    }
}

export namespace MyReturnType {

    export type Flatten = {
        v1: string;
        v2: number;
    };

    export class TypeBuilder implements ITypeBuilder<Flatten, MyReturnType> {

        public build(raw: Flatten): MyReturnType {
            return new MyReturnType(
                raw.v1,
                raw.v2
            );
        }
    }

    export const typeBuilder = new TypeBuilder();
}
