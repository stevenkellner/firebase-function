import { type CryptedScheme } from '../src/database/SchemeType';

interface TestType1 {
    v1: string;
    v2: {
        v3: number;
        v4: CryptedScheme<string>;
    };
    v5: CryptedScheme<{
        v6: boolean;
        v7: null;
    }>;
    v8: Array<CryptedScheme<number>>;
    v9: CryptedScheme<number[]>;
    v10: number[];
}
