import { createFirebaseFunctionCreators } from '../../../src';
import { MyFirebaseFunction } from './MyFirebaseFunction';
import { MyFirebaseRequest } from './MyFirebaseRequest';
import { MyFirebaseSchedule } from './MyFirebaseSchedule';

export const firebaseFunctionCreators = createFirebaseFunctionCreators(builder => ({
    function1: builder.function(MyFirebaseFunction),
    requests: {
        request1: builder.request(MyFirebaseRequest)
    },
    schedule1: builder.schedule(MyFirebaseSchedule, '0 0 1 1 *', 'europe/berlin')
}));
