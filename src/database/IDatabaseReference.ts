import type { IDatabaseScheme } from './IDatabaseScheme';
import type { IDatabaseSnapshot } from './IDatabaseSnapshot';

export interface IDatabaseReference<Scheme extends IDatabaseScheme> {

    snapshot(): Promise<IDatabaseSnapshot<Scheme>>;

    child<Key extends IDatabaseScheme.Key<Scheme>>(key: Key & string): IDatabaseReference<IDatabaseScheme.Child<Scheme, Key>>;

    set(value: IDatabaseScheme.UncryptedValue<Scheme>): Promise<void>;

    setCrypted(value: IDatabaseScheme.CryptedValue<Scheme>): Promise<void>;

    remove(): Promise<void>;
}
