import type { CryptedScheme } from '../src';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type DatabaseScheme = {
    persons: {
        [PersonId in string]: CryptedScheme<{ name: string; age: number }>
    };
    animals: {
        [AnimalId in string]: { name: string }
    };
};
