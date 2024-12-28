import type { ITypeBuilder, Flattable } from '@stevenkellner/typescript-common-functionality';
import { createFirebaseFunctions, type FirebaseFunction, type FirebaseRequest, IFirebaseFunction, IFirebaseRequest } from '../../client';
import { configDotenv } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';

export class TestParameters implements Flattable<TestParameters.Flatten> {

    public constructor(
        public readonly v1: string,
        public readonly v2: number[],
        public readonly v3: SubParameter
    ) {}

    public get flatten(): TestParameters.Flatten {
        return {
            v1: this.v1,
            v2: this.v2,
            v3: this.v3.flatten
        };
    }
}

export namespace TestParameters {

    export type Flatten = {
        v1: string;
        v2: number[];
        v3: SubParameter.Flatten;
    };

    export class TypeBuilder implements ITypeBuilder<Flatten, TestParameters> {

        public build(value: Flatten): TestParameters {
            return new TestParameters(value.v1, value.v2, new SubParameter.TypeBuilder().build(value.v3));
        }
    }
}

export class SubParameter implements Flattable<SubParameter.Flatten> {

    public constructor(
        public readonly v1: 'a' | 'b'
    ) {}

    public get flatten(): SubParameter.Flatten {
        return this.v1 === 'a';
    }
}

export namespace SubParameter {

    export type Flatten = boolean;

    export class TypeBuilder implements ITypeBuilder<Flatten, SubParameter> {

        public build(value: Flatten): SubParameter {
            return new SubParameter(value ? 'a' : 'b');
        }
    }
}

export class TestReturnType implements Flattable<TestReturnType.Flatten> {

    public constructor(
        public readonly rawV1: string,
        public readonly rawV2: number
    ) {}

    public get flatten(): TestReturnType.Flatten {
        return {
            v1: `${this.rawV1} flattened`,
            v2: this.rawV2 + 10
        };
    }
}

export namespace TestReturnType {

    export type Flatten = {
        v1: string;
        v2: number;
    };

    export class TypeBuilder implements ITypeBuilder<Flatten, TestReturnType> {

        public build(value: Flatten): TestReturnType {
            return new TestReturnType(value.v1.slice(0, value.v1.length - 10), value.v2 - 10);
        }
    }
}

export class TestFirebaseFunction extends IFirebaseFunction<TestParameters, TestReturnType> {

    public readonly returnTypeBuilder = new TestReturnType.TypeBuilder();
}

export class TestFirebaseRequest extends IFirebaseRequest<TestParameters, TestReturnType> {

    public readonly returnTypeBuilder = new TestReturnType.TypeBuilder();
}

export class FirebaseFunctions {

    public firebaseFunctions!: {
        function1: FirebaseFunction<TestParameters, TestReturnType>;
        requests: {
            request1: FirebaseRequest<TestParameters, TestReturnType>;
        };
    };

    public firebaseFunctionsWithInvalidMacKey!: typeof this.firebaseFunctions;

    public setup(): void {
        configDotenv({ path: 'test/.env.test' });
        initializeApp({
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            databaseURL: process.env.FIREBASE_DATABASE_URL,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID
        });
        const functions = getFunctions(undefined, 'europe-west1');
        connectFunctionsEmulator(functions, '127.0.0.1', 5001);

        const macKey = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
        this.firebaseFunctions = createFirebaseFunctions(`http://127.0.0.1:5001/${process.env.FIREBASE_PROJECT_ID}`, 'europe-west1', macKey, builder => ({
            function1: builder.function(TestFirebaseFunction),
            requests: {
                request1: builder.request(TestFirebaseRequest)
            }
        }));

        this.firebaseFunctionsWithInvalidMacKey = createFirebaseFunctions(`http://127.0.0.1:5001/${process.env.FIREBASE_PROJECT_ID}`, 'europe-west1', new Uint8Array(), builder => ({
            function1: builder.function(TestFirebaseFunction),
            requests: {
                request1: builder.request(TestFirebaseRequest)
            }
        }));
    }
}
