import { db } from "./db.js";
export function updateUserString(userInputString: string) {
  db.data.userInputString = userInputString;
  db.write();
}
