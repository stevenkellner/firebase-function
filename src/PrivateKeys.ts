import { type Crypter } from './crypter';

export interface PrivateKeys {
    cryptionKeys: Crypter.Keys;
    callSecretKey: string;
    databaseUrl: string;
}
