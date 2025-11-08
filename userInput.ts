import { db } from "./db.js";
import client from "./openai.js";
import { updateTravelerState } from "./travelerState.js";

export function updateUserString(userInputString: string) {
  db.data.userInputString = userInputString;
  db.write();

  updateTravelerStateBasedOnInput(userInputString);
}

function updateTravelerStateBasedOnInput(userInputString: string) {
  updateTravelerState("", userInputString);
}