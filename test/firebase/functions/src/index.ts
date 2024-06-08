/* eslint-disable max-len */
import {createFirebaseFunctions, provideFirebaseFunctions} from "firebase-function";
import {TestFirebaseFunction} from "./TestFirebaseFunction";
import {TestFirebaseRequest} from "./TestFirebaseRequest";
import {TestFirebaseSchedule} from "./TestFirebaseSchedule";

const firebaseFunctions = createFirebaseFunctions((builder) => ({
  function1: builder.function(TestFirebaseFunction),
  requests: {
    request1: builder.request(TestFirebaseRequest),
  },
  schedule1: builder.schedule(TestFirebaseSchedule, "0 0 1 1 *", "europe/berlin"),
}));

const macKey = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
export = provideFirebaseFunctions(firebaseFunctions, macKey, ["europe-west1"]);
