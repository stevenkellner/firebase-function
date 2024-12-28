# Firebase Function

## Overview

A TypeScript library designed to simplify the creation and deployment of Firebase functions. It provides a structured and type-safe way to define Firebase functions, requests, and schedules.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
    - [Creating Firease Function / Request / Schedule](#creating-firease-function--request--schedule)
    - [Creating Firebase Functions Strukture](#creating-firebase-functions-strukture)
    - [Providing Firebase Functions](#providing-firebase-functions)
    - [Call Function on Client](#call-function-on-client)
- [Testing](#testing)
- [Continuous Integration](#continuous-integration)
- [License](#license)
- [Contributing](#contributing)

## Features

- **TypeScript Support**: Leverage the power of TypeScript for type safety and better development experience.
- **Firebase Functions**: Easily create and manage Firebase functions.
- **Firebase Requests**: Define and handle Firebase HTTPS requests.
- **Firebase Schedules**: Schedule and manage Firebase scheduled functions.

## Installation

To install the package, use npm:

```bash
npm install @stevenkellner/firebase-function
```

## Usage

### Creating Firease Function / Request / Schedule

To create a Firebase function, request, or schedule, use the respective builder methods provided by the library. Here is an example:

```typescript
import { FirebaseFunction, FirebaseRequest, FirebaseSchedule } from '@stevenkellner/firebase-function/admin';
import type { ITypeBuilder } from '@stevenkellner/typescript-common-functionality';

export class MyFirebaseFunction extends FirebaseFunction<MyParameters, MyReturnType> {

    public parametersBuilder: ITypeBuilder<Flatten<MyParameters>, MyParameters> = // Type builder to build parameters

    public constructor(userId: string | null) {
        super();
    }

    public async execute(parameters: MyParameters): Promise<MyReturnType> {
        // Function execution logic here
    }
}

export class MyFirebaseRequest extends FirebaseRequest<MyParameters, MyReturnType> {

    public parametersBuilder: ITypeBuilder<Flatten<MyParameters>, MyParameters> = // Type builder to build parameters

    public constructor() {
        super();
    }

    public async execute(parameters: MyParameters): Promise<MyReturnType> {
        // Request execution logic here
    }
}

export class MyFirebaseSchedule extends FirebaseSchedule {

    public constructor() {
        super();
    }

    public async execute(): Promise<void> {
        // Schedule execution login here
    }
}

```

### Creating Firebase Functions Strukture

To create Firebase functions, use the `createFirebaseFunctions` method:

```typescript
import { createFirebaseFunctions } from '@stevenkellner/firebase-function/admin';

const firebaseFunctions = createFirebaseFunctions(builder => ({
    function: builder.function(MyFirebaseFunction),
    requests: {
        request: builder.request(MyFirebaseRequest)
    },
    schedule: builder.schedule(MyFirebaseSchedule, "0 0 1 1 *", "europe/berlin")
}));
```

### Providing Firebase Functions

To provide Firebase functions, use the `provideFirebaseFunctions` method:

```typescript
import { provideFirebaseFunctions } from '@stevenkellner/firebase-function/admin';

const macKey = // My private message authenication key
const regions = ['europe-west1'];

const runnableFunctions = provideFirebaseFunctions(firebaseFunctions, macKey, regions);
```

### Call Function on Client

To call a Firebase function on the client side, use the `httpsCallable` method from the Firebase SDK. Here is an example:

```typescript
import type { ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { createFirebaseFunctions, IFirebaseFunction, IFirebaseRequest } from '../../client';
import { initializeApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';

export class MyFirebaseFunction extends IFirebaseFunction<MyParameters, MyReturnType> {

    public readonly returnTypeBuilder: ITypeBuilder<Flatten<MyReturnType>, MyReturnType> = // Type builder to build return type
}

export class MyFirebaseRequest extends IFirebaseRequest<MyParameters, MyReturnType> {

    public readonly returnTypeBuilder: ITypeBuilder<Flatten<MyReturnType>, MyReturnType> = // Type builder to build return type
}

initializeApp({
    apiKey: // Your FIREBASE_API_KEY,
    authDomain: // Your FIREBASE_AUTH_DOMAIN,
    databaseURL: // Your FIREBASE_DATABASE_URL,
    projectId: // Your FIREBASE_PROJECT_ID,
    storageBucket: // Your FIREBASE_STORAGE_BUCKET,
    messagingSenderId: // Your FIREBASE_MESSAGING_SENDER_ID,
    appId: // Your FIREBASE_APP_ID
});
const functions = getFunctions(undefined, 'europe-west1');

const macKey = // My private message authenication key
const firebaseFunctions = createFirebaseFunctions(/* Your base url to firebase functions */, 'europe-west1', macKey, builder => ({
    function: builder.function(MyFirebaseFunction),
    requests: {
        request: builder.request(MyFirebaseRequest)
    }
}));
```

## Testing

To run tests, use the following command:

```bash
npm run test
```

To generate a coverage report, use:

```bash
npm run test:coverage
```

and view it with

```bash
npm run coverage:report
```

## Continuous Integration
### Build, Test and Lint
[![Build, test and lint Node.js Package](https://github.com/stevenkellner/firebase-function/actions/workflows/build-test-lint.yml/badge.svg)](https://github.com/stevenkellner/firebase-function/actions/workflows/build-test-lint.yml)

On each push and pull request, the CI runs the build, test and lint script to verify the package.

### Coverage Report
[![Run Test with Coverage Report and upload it to Github Pages](https://github.com/stevenkellner/firebase-function/actions/workflows/coverage-report.yml/badge.svg)](https://github.com/stevenkellner/firebase-function/actions/workflows/coverage-report.yml)

The coverage report is generated automatically by the CI on each push and pull request. You can view the latest coverage report [here](https://stevenkellner.github.io/firebase-function/).

### Publish to npm
[![Publish Node.js Package](https://github.com/stevenkellner/firebase-function/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/stevenkellner/firebase-function/actions/workflows/npm-publish.yml)

The library is published automatically as a npm package and a github release is created by the CI on each new release tag. The npm package can be found [here](https://www.npmjs.com/package/@stevenkellner/firebase-function), you can install it with `npm install @stevenkellner/firebase-function`.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.
