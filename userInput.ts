import { db } from "./db.ts";
export function updateUserString(userInputString: string) {
  db.data.userInputString = userInputString;
  db.write();
}
