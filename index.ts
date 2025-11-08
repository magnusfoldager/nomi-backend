import express from "express";
import type { Request, Response } from "express";

import 'dotenv/config'
console.log(process.env["OPENAI_API_KEY"]);

const app = express()
const port = 3000

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.get('/recommendations', (req: any, res: { json: (arg0: { id: number; title: string; type: string }[]) => void }) => {
  const recommendations = getRecommendations()
  res.json(recommendations)
})

interface UpdateParametersBody {
    time: string; // Time
    location: string; // Location "lat,long"
}

app.post('/update-server-parameters', (req: Request<{}, {}, UpdateParametersBody>, res: Response) => {
    try {
        // Destructure the data from the request body
        const { time, location } = req.body;

        // Optional: Parse the combined lat/long string from the select dropdown
        if (time && location.includes(',')) {
            const [latitude, longitude] = location.split(',').map((coord: string) => parseFloat(coord.trim()));
            console.log(`Parsed -> Lat: ${latitude}, Long: ${longitude}`);

            // Validate parsed numbers
            if (isNaN(latitude) || isNaN(longitude)) {
                 res.status(400).send('Invalid location format received.');
                 return;
            }
            
            // TODO: Implement updating DB
        }

        // Send a success response to the browser
        res.send('Parameters updated successfully!');
        // Alternatively, redirect back to the form page:
        // res.redirect('/'); 

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
  console.log(`Nomi Backend listening on ${port}`);
});
