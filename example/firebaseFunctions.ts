import { FirebaseDescriptor, type FirebaseFunctions } from '../src';
import { AddPersonFunction, type AddPersonFunctionType } from './AddPersonFunction';
import { GetAnimalsFunction, type GetAnimalsFunctionType } from './GetAnimalsFunction';
import { GetPersonRequest, type GetPersonRequestType } from './GetPersonRequest';
import { PetAnimalsSchedule } from './PetAnimalsSchedule';

export const firebaseFunctions = {
    person: {
        add: FirebaseDescriptor._function<AddPersonFunctionType>(AddPersonFunction),
        get: FirebaseDescriptor.request<GetPersonRequestType>(GetPersonRequest)
    },
    animal: {
        get: FirebaseDescriptor._function<GetAnimalsFunctionType>(GetAnimalsFunction),
        pet: FirebaseDescriptor.schedule('0 0 15 ? * * *', PetAnimalsSchedule)
    }
} satisfies FirebaseFunctions;
