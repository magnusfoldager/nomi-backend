import client, { ACI_MCP } from "./openai.ts";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { db } from "./db.ts";

async function checkForHotels() {
  const formatSchema = z.object({
    foundHotels: z.boolean(),
    hotels: z
      .array(
        z.object({
          hotelName: z.string(),
          address: z.string(),
          checkIn: z.string(),
          checkOut: z.string(),
          bookingReference: z.string(),
          roomType: z.string(),
          numberOfNights: z.string(),
        })
      )
      .optional()
      .default([]),
  });

  const response = await client.responses.parse({
    model: "gpt-5",
    instructions:
      "Your job is to use ACTIONS to check for hotel bookings. the tool call is called GMAIL__MESSAGES_LIST. You might not find the hotels, if you dont just return false for foundHotels. If you find the hotels, return all hotels in the hotels array.",
    tools: [ACI_MCP],
    input: "try to find hotels in email",
    text: {
      format: zodTextFormat(formatSchema, "hotels"),
    },
  });

  if (!response.output_parsed) {
    return false;
  }

  if (response.output_parsed.foundHotels && response.output_parsed.hotels && response.output_parsed.hotels.length > 0) {
    db.update((db) => {
      // Add new hotels, avoiding duplicates based on booking reference
      const existingRefs = new Set(db.hotels.map(h => h.bookingReference));
      const newHotels = response.output_parsed!.hotels!.filter(
        hotel => !existingRefs.has(hotel.bookingReference)
      );
      db.hotels.push(...newHotels);
      return db;
    });
    return true;
  } else {
    return false;
  }
}

export default checkForHotels;
