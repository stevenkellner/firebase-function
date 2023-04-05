# Firebase Function

Used to manage a backend api with firebase functions by creating a single firebase function for an api functionallity, these functions also handles security be encrypting / decrypting the parameters and return type. Also allows easy, secure and type-save access to the firebase realtime-database.  

## Table of Contents

- [Firebase Function](#firebase-function)
    - [Table of Contents](#table-of-contents)
    - [Create a new Firebase Function](#create-a-new-firebase-function)
    - [Deploy the Functions](#deploy-the-functions)
    - [Function Parameters](#function-parameters)
    - [Return type](#return-type)
    - [Security / Private Keys](#security-private-keys) / TODO: Auth
    - TODO: Error Handling
    
## Create a new Firebase Function

You can create a new firebase function by declaring a new class that conforms to `FirebaseFunction<MyFunctionType>` interface.

```typescript
import { type FirebaseFunction, type ILogger, ParameterContainer, ParameterParser, type FunctionType } from 'firebase-function';
import { type AuthData } from 'firebase-functions/lib/common/providers/tasks';

export class MyFunction implements FirebaseFunction<MyFunctionType> {
    public readonly parameters: FunctionType.Parameters<MyFunctionType> & { databaseType: DatabaseType };

    public constructor(data: Record<string, unknown> & { databaseType: DatabaseType }, auth: AuthData | undefined, private readonly logger: ILogger) {
        this.logger.log('MyFunction.constructor', { data: data, auth: auth }, 'notice');
        const parameterContainer = new ParameterContainer(data, getPrivateKeys, this.logger.nextIndent);
        const parameterParser = new ParameterParser<FunctionType.Parameters<EventEditFunctionType>>({}, this.logger.nextIndent);
        parameterParser.parseParameters(parameterContainer);
        this.parameters = parameterParser.parameters;
    }

    public async executeFunction(): Promise<FunctionType.ReturnType<MyFunctionType>> {
        this.logger.log('MyFunction.executeFunction', {}, 'info');
        // Do whatever your function should do
    }
}

export type MyFunctionType = FunctionType<Record<string, never>, void>;
```

This is the skeleton of a empty firebase function with no parameters. To add parameters to your firebase function see [Function Parameters](#function-parameters). If you want to return a value back to the frontend, see the [Return type](#return-type) Chapter.

You can get this skeleton via autocompletition in VS-Code, just add the `functions.code-snippets` file to your `.vscode` folder.

## Deploy the Functions

To deploy your firebase functions, add them in a seperate file such that they satisfies the `FirebaseFunctionsType`. **Important**: The `satisties` keyword requiers at least Typescript 4.9.

```typescript
import { FirebaseFunctionDescriptor, type FirebaseFunctionsType } from 'firebase-function';
import { MyFunction, type MyFunctionType } from './MyFunction';
import { MyOtherFunction, type MyOtherFunctionType } from './MyOtherFunction';
import { MyThirdFunction, type MyThirdFunctionType } from './MyThirdFunction';

export const firebaseFunctions = {
    myFunction: FirebaseFunctionDescriptor.create<MyFunctionType>(MyFunction),
    myNamespace: {
        myOtherFunction: FirebaseFunctionDescriptor.create<MyOtherFunctionType>(MyOtherFunction),
        myThirdFunction: FirebaseFunctionDescriptor.create<MyThirdFunctionType>(MyThirdFunction)
    }
} satisfies FirebaseFunctionsType;
```

You can nest multiple functions in a namespace by adding them in a nested object. These functions than have the prefix of the namespace, seperated by a `-`. You can nest functions in as many namespaces as you wish. In this example you deploy three functions with names: `myFunction`, `myNamespace-myOtherFunction` and `myNamespace-myThirdFunction`.

Then in your `index.ts` file you initialize the app and make the firebase functions deployable:

```typescript
import * as admin from 'firebase-admin';
import { createFirebaseFunctions } from 'firebase-function';
import { firebaseFunctions } from './firebaseFunctions';
import { getPrivateKeys } from './privateKeys';

admin.initializeApp();

export = createFirebaseFunctions(firebaseFunctions, getPrivateKeys);
```

Learn more about the private keys and how the functions are secured in [Security / Private Keys](#security-private-keys).

At the end deploy your functions as always by running `firebase deploy --only functions` in your firebase directory.
