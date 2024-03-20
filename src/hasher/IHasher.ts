export interface IHasher {

    hash(value: string, hmacKey?: string | null): string;
}
