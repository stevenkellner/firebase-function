import type { ILogger } from '../logger';
import type { ITypeBuilder } from './ITypeBuilder';

export class OptionalTypeBuilder<V, T> implements ITypeBuilder<V | null, T | null> {

    public constructor(
        private readonly builder: ITypeBuilder<V, T>
    ) {}

    public build(value: V | null, logger: ILogger): T | null {
        if (value === null)
            return null;
        return this.builder.build(value, logger);
    }
}
