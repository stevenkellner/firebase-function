import type { ILogger } from '../logger';
import type { ITypeBuilder } from '../typeBuilder';
import type { Flattable } from './Flattable';
import { Guid } from './Guid';

export class Tagged<T, Tag> implements Flattable<T> {

    public constructor(
        public readonly value: T,
        public readonly tag: Tag
    ) {}

    public get flatten(): T {
        return this.value;
    }

    public static generate<Tag>(tag: Tag): Tagged<Guid, Tag> {
        return new Tagged(Guid.generate(), tag);
    }

    public get guidString(): T extends Guid ? string : never {
        return (this.value as Guid).guidString as T extends Guid ? string : never;
    }
}

export namespace Tagged {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type TypeOf<T extends Tagged<any, any>> = T extends Tagged<infer V, any> ? V : never;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type TagOf<T extends Tagged<any, any>> = T extends Tagged<any, infer Tag> ? Tag : never;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TaggedTypeBuilder<V, T extends Tagged<any, any>> implements ITypeBuilder<V, T> {

    public constructor(
        private readonly tag: Tagged.TagOf<T>,
        private readonly builder: ITypeBuilder<V, Tagged.TypeOf<T>>
    ) { }

    public build(value: V, logger: ILogger): T {
        return new Tagged(this.builder.build(value, logger), this.tag) as T;
    }
}
