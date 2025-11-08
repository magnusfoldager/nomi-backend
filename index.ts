import express, { type Request, type Response } from "express";
import { db } from "./db.ts";
import "dotenv/config";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

import getRecommendations from "./recommendations.ts";
import cron from "node-cron";
import checkForFlights from "./flights.ts";
import checkForHotels from "./hotels.ts";
import { updateUserString } from "./userInput.ts";

cron.schedule("* * * * *", () => {
  checkForFlights().then((found) => {
    if (found) {
      console.log("Flights found");
    } else {
      console.log("No flights found");
    }
  });
});
cron.schedule("* * * * *", () => {
  checkForHotels().then((found) => {
    if (found) {
      console.log("Hotels found");
    } else {
      console.log("No hotels found");
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

app.get("/flights", (req: Request, res: Response) => {
  try {
    const flightsData = {
      foundFlights: (db.data as any).flights?.length > 0 || false,
      flights: (db.data as any).flights || [],
    };
    res.json(flightsData);
  } catch (error) {
    console.error("Error fetching flights:", error);
    res.status(500).json({ error: "Failed to fetch flights" });
  }
});

app.get("/backoffice", (req: Request, res: Response) => {
  res.sendFile("./backoffice.html", { root: "." });
});

interface UpdateParametersBody {
  time: string; // Time
  location: string; // Location "lat,long"
}

app.post(
  "/update-server-parameters",
  (req: Request<{}, {}, UpdateParametersBody>, res: Response) => {
    try {
      // Destructure the data from the request body
      const { time, location } = req.body;

      // Optional: Parse the combined lat/long string from the select dropdown
      if (time && location.includes(",")) {
        const [latitude, longitude] = location
          .split(",")
          .map((coord: string) => parseFloat(coord.trim()));
        console.log(`Parsed -> Lat: ${latitude}, Long: ${longitude}`);

        // Validate parsed numbers
        if (isNaN(latitude) || isNaN(longitude)) {
          res.status(400).send("Invalid location format received.");
          return;
        }

        // TODO: Implement updating DB
      }

      // Send a success response to the browser
      res.send("Parameters updated successfully!");
      // Alternatively, redirect back to the form page:
      // res.redirect('/');
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

app.post(
  "/set-user-input-string",
  (req: Request<{}, {}, { userInputString: string }>, res: Response) => {
    try {
      const { userInputString } = req.body;

      if (userInputString) {
        updateUserString(userInputString);

        res.json({ status: "success", message: "User input string updated." });
      }
    } catch (error) {
      console.error("Error processing request:", error);
      res
        .status(500)
        .json({ status: "error", message: "Internal Server Error" });
    }
  }
);

app.listen(port, () => {
  console.log(`Nomi Backend listening on ${port}`);
});
