import { FirebaseFunctionsContext, FirebaseFunctionsExecutableContext } from '../../../src';
import { MyFirebaseFunction, MyFirebaseExecutableFunction } from './MyFirebaseFunction';
import { MyFirebaseRequest, MyFirebaseExecutableRequest } from './MyFirebaseRequest';
import { MyFirebaseSchedule, MyFirebaseExecutableSchedule } from './MyFirebaseSchedule';

export const firebaseFunctionsContext = FirebaseFunctionsContext.build(builder => ({
    function1: builder.function(MyFirebaseFunction),
    requests: {
        request1: builder.request(MyFirebaseRequest)
    },
    schedule1: builder.schedule(MyFirebaseSchedule)
}));

export const firebaseFunctionsExecutableContext = FirebaseFunctionsExecutableContext.build<typeof firebaseFunctionsContext>(builder => ({
    function1: builder.function(MyFirebaseExecutableFunction),
    requests: {
        request1: builder.request(MyFirebaseExecutableRequest)
    },
    schedule1: builder.schedule(MyFirebaseExecutableSchedule, '0 0 1 1 *', 'europe/berlin')
}));
