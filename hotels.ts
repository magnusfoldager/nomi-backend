import client, { ACI_MCP } from "./openai.ts";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { db } from "./db.ts";

async function checkForHotels() {
  const formatSchema = z.object({
    foundHotels: z.boolean(),
    hotel: z
      .object({
        hotelName: z.string(),
        address: z.string(),
        checkIn: z.string(),
        checkOut: z.string(),
        bookingReference: z.string(),
        roomType: z.string(),
        numberOfNights: z.string(),
      })
      .optional()
      .nullable(),
  });

  const response = await client.responses.parse({
    model: "gpt-5",
    instructions:
      "Your job is to use ACTIONS to check for hotel bookings. the tool call is called GMAIL__MESSAGES_LIST. You might not find the hotels, if you dont just return false for foundHotels. If you find the hotels, return the hotel in the hotel object.",
    tools: [ACI_MCP],
    input: "try to find hotels in email",
    text: {
      format: zodTextFormat(formatSchema, "hotels"),
    },
  });

  if (!response.output_parsed) {
    return false;
  }

  if (response.output_parsed.foundHotels && response.output_parsed.hotel) {
    db.update((db) => {
      db.foundHotels = true;
      db.hotel = response.output_parsed!.hotel ?? null;
      return db;
    });
    return true;
  } else {
    db.update((db) => {
      db.foundHotels = false;
      db.hotel = null;
      return db;
    });
    return false;
  }
}

export default checkForHotels;
