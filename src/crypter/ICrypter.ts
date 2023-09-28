export interface ICrypter {
    encodeEncrypt(data: unknown): string;

    decryptDecode(data: ''): undefined;
    decryptDecode<T = unknown>(data: string): T;
}
