/* eslint-disable require-jsdoc */
import {FirebaseSchedule} from "firebase-function";

export class TestFirebaseSchedule implements FirebaseSchedule {
  public async execute(): Promise<void> {
    console.log("TestFirebaseSchedule.execute");
  }
}
