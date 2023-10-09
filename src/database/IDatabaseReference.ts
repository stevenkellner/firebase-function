import type { CryptedScheme, IDatabaseScheme } from './IDatabaseScheme';
import type { IDatabaseSnapshot } from './IDatabaseSnapshot';

export interface IDatabaseReference<DatabaseScheme extends IDatabaseScheme> {
    snapshot(): Promise<IDatabaseSnapshot<DatabaseScheme>>;

    child<Key extends true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : (keyof DatabaseScheme & string)>(key: Key): IDatabaseReference<DatabaseScheme extends Record<string, IDatabaseScheme> ? DatabaseScheme[Key] : never>;

    set(value: CryptedScheme.GetType<DatabaseScheme>, crypted: 'encrypt'): Promise<void>;
    set(value: true extends CryptedScheme.IsCrypted<DatabaseScheme> ? never : DatabaseScheme): Promise<void>;

    remove(): Promise<void>;
}
