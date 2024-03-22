export interface IMessageAuthenticator {

    sign(message: Uint8Array): Uint8Array;

    verify(message: Uint8Array, tag: Uint8Array): boolean;
}
