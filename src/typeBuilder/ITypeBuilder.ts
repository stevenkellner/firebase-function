import type { ILogger } from '../logger';

export interface ITypeBuilder<V, T> {

    build(value: V, logger: ILogger): T;
}
