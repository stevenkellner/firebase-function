// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
type Scheme = boolean | string | number | null | SchemeType[] | { [key: string]: SchemeType };

export interface CryptedScheme<T extends Scheme> {
    value: T;
    crypted: true;
}

export type SchemeType = Scheme | CryptedScheme<Scheme> | CryptedScheme<Scheme>;

export type GetCryptedScheme<T extends SchemeType> = T extends CryptedScheme<infer Scheme> ? Scheme : never;

export type IsCryptedScheme<T extends SchemeType> = T extends CryptedScheme<Scheme> ? true : never;
