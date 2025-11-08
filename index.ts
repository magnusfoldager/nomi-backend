import express from "express";

import 'dotenv/config'
console.log(process.env["OPENAI_API_KEY"]);

const app = express();
const port = 3000;

import getRecommendations from "./recommendations.ts";
import cron from "node-cron";
import checkForFlights from "./flights.ts";

cron.schedule("* * * * *", () => {
  checkForFlights().then((found) => {
    if (found) {
      console.log("Flights found");
    } else {
      console.log("No flights found");
    }
  });
});

app.get("/", (req: any, res: { send: (arg0: string) => void }) => {
  res.send("NOMI!");
});

app.get(
  "/recommendations",
  (
    req: any,
    res: { json: (arg0: { id: number; title: string; type: string }[]) => void }
  ) => {
    const recommendations = getRecommendations();
    res.json(recommendations);
  }
);

app.listen(port, () => {
  console.log(`Nomi Backend listening on ${port}`);
});
