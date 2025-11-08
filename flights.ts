import client, { ACI_MCP } from "./openai.ts";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { db } from "./db.ts";

async function checkForFlights() {
  const formatSchema = z.object({
    foundFlights: z.boolean(),
    flights: z
      .array(
        z.object({
          airline: z.string(),
          flightNumber: z.string(),
          departure: z.string(),
          arrival: z.string(),
          departureTime: z.string(),
          arrivalTime: z.string(),
          bookingReference: z.string(),
          flightDuration: z.string(),
          flightTerminal: z.string(),
        })
      )
      .optional()
      .default([]),
  });

  const response = await client.responses.parse({
    model: "gpt-5",
    instructions:
      "Your job is to use ACTIONS to check for flight bookings. the tool call is called GMAIL__MESSAGES_LIST. You might not find the flights, if you dont just return false for foundFlights. If you find the flights, return all flights in the flights array.",
    tools: [ACI_MCP],
    input: "try to find flights in user email",
    text: {
      format: zodTextFormat(formatSchema, "flights"),
    },
  });

  if (!response.output_parsed) {
    return false;
  }

  if (
    response.output_parsed.foundFlights &&
    response.output_parsed.flights &&
    response.output_parsed.flights.length > 0
  ) {
    db.update((db) => {
      // Add new flights, avoiding duplicates based on booking reference
      const existingRefs = new Set(db.flights.map((f) => f.bookingReference));
      const newFlights = response.output_parsed!.flights!.filter(
        (flight) => !existingRefs.has(flight.bookingReference)
      );
      db.flights.push(...newFlights);
      return db;
    });
    return true;
  } else {
    return false;
  }
}

export default checkForFlights;
