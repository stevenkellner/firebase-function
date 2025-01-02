import { type Flattable, TypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type MyParameters = {
    v1: string;
    v2: number[];
    v3: MySubParameter;
};

export namespace MyParameters {

    export type Flatten = {
        v1: string;
        v2: number[];
        v3: MySubParameter.Flatten;
    };
}

export class MySubParameter implements Flattable<MySubParameter.Flatten> {

    public constructor(
        public readonly v1: 'a' | 'b'
    ) {}

    public get flatten(): boolean {
        return this.v1 === 'a';
    }
}

export namespace MySubParameter {

    export type Flatten = boolean;

    export const typeBuilder = new TypeBuilder<Flatten, MySubParameter>(value => new MySubParameter(value ? 'a' : 'b'));
}
