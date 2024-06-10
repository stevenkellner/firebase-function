import type { ITypeBuilder } from './ITypeBuilder';
import type { ILogger } from '../logger';

export class ArrayTypeBuilder<V, T> implements ITypeBuilder<V[], T[]> {

    public constructor(
        private readonly builder: ITypeBuilder<V, T>
    ) {}

    public build(value: V[], logger: ILogger): T[] {
        return value.map(element => this.builder.build(element, logger));
    }
}
