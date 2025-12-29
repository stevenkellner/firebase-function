import { Tagged, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

/**
 * A tagged type representing a user authentication ID.
 */
export type UserAuthId = Tagged<string, 'userAuthId'>;

export namespace UserAuthId {

    /**
     * Flattened representation of a user authentication ID (plain string).
     */
    export type Flatten = string;

    /**
     * Builder for constructing User.AuthId instances from strings.
     */
    export const builder = Tagged.builder('userAuthId' as const, new ValueTypeBuilder<string>());
}
