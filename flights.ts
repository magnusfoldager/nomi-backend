import client, { ACI_MCP } from "./openai.ts";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { db } from "./db.ts";

async function checkForFlights() {
  const formatSchema = z.object({
    foundFlights: z.boolean(),
    flight: z
      .object({
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
      .optional()
      .nullable(),
  });

  const response = await client.responses.parse({
    model: "gpt-5",
    instructions:
      "Your job is to use ACTIONS to check for flights to tokyo from SAS. the tool call is called GMAIL__MESSAGES_LIST. You might not find the flights, if you dont just return false for foundFlights. If you find the flights, return the flights in the flights array.",
    tools: [ACI_MCP],
    input: "try to find flights in user email",
    text: {
      format: zodTextFormat(formatSchema, "flights"),
    },
  });

  if (!response.output_parsed) {
    return false;
  }

  if (response.output_parsed.foundFlights && response.output_parsed.flight) {
    db.update((db) => {
      db.foundFlights = true;
      db.flight = response.output_parsed!.flight ?? null;
      return db;
    });
    return true;
  } else {
    db.update((db) => {
      db.foundFlights = false;
      db.flight = null;
      return db;
    });
    return false;
  }
}

export default checkForFlights;
