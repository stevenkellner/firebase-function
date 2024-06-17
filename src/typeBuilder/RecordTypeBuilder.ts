import type { ILogger } from '../logger';
import { mapRecord } from '../utils';
import type { ITypeBuilder } from './ITypeBuilder';

export class RecordTypeBuilder<V, T> implements ITypeBuilder<Record<string, V>, Record<string, T>> {

    public constructor(
        private readonly builder: ITypeBuilder<V, T>
    ) {}

    public build(value: Record<string, V>, logger: ILogger): Record<string, T> {
        return mapRecord(value, value => this.builder.build(value, logger));
    }
}
