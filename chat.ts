import client from "./openai.js";
import { db } from "./db.js";
import { extractMemory } from "./extractMemory.js";
import type { Response } from "express";

function buildContextMessage(): string {
  const contextParts = [
    "You are Nomie, a friendly and casual AI travel assistant. Keep your responses SHORT and conversational - like texting a friend. Use a warm, helpful tone but stay concise. Don't over-explain. Get straight to the point.",
    "",
    "User Memories (important context about the user):",
    db.data.memories.length > 0
      ? db.data.memories.map((m, i) => `${i + 1}. ${m}`).join("\n")
      : "No memories yet.",
    "",
    "Traveler State:",
    `- Tiredness: ${db.data.travelerState.tiredness}`,
    `- Hunger: ${db.data.travelerState.hunger}`,
    `- Sociability: ${db.data.travelerState.sociability}`,
    `- Adventurousness: ${db.data.travelerState.adventurousness}`,
    `- Curiosity: ${db.data.travelerState.curiosity}`,
    `- Stress Level: ${db.data.travelerState.stressLevel}`,
    `- Spending Willingness: ${db.data.travelerState.spendingWillingness}`,
    `- Safety Feeling: ${db.data.travelerState.safetyFeeling}`,
    `- Spontaneity: ${db.data.travelerState.spontaneity}`,
    `- Patience: ${db.data.travelerState.patience}`,
    "",
  ];

  if (db.data.flights.length > 0) {
    contextParts.push("Flights:");
    db.data.flights.forEach((flight, i) => {
      contextParts.push(
        `${i + 1}. ${flight.airline} ${flight.flightNumber}: ${
          flight.departure
        } to ${flight.arrival} on ${flight.departureTime}`
      );
    });
    contextParts.push("");
  }

  if (db.data.hotels.length > 0) {
    contextParts.push("Hotels:");
    db.data.hotels.forEach((hotel, i) => {
      contextParts.push(
        `${i + 1}. ${hotel.hotelName} - ${hotel.address}, Check-in: ${
          hotel.checkIn
        }, Check-out: ${hotel.checkOut}`
      );
    });
    contextParts.push("");
  }

  if (db.data.recommendations.length > 0) {
    contextParts.push("Current Recommendations:");
    db.data.recommendations.forEach((rec, i) => {
      contextParts.push(
        `${i + 1}. ${rec.title} (${rec.type}): ${rec.description}`
      );
    });
    contextParts.push("");
  }

  if (db.data.userInputString) {
    contextParts.push(`Additional context: ${db.data.userInputString}`);
    contextParts.push("");
  }

  return contextParts.join("\n");
}

export async function handleChatStream(
  message: string,
  res: Response
): Promise<void> {
  const systemMessage = buildContextMessage();

  // Stream the response from OpenAI using GPT-5
  const stream = await client.responses.create({
    model: "gpt-5",
    instructions: systemMessage,
    input: [{ role: "user", content: message }],
    stream: true,
    reasoning: {
      effort: "minimal"
    },
  });

  let fullResponse = "";

  for await (const event of stream) {
    if (event.type !== "response.output_text.delta") {
      continue;
    }
    const content = event.delta || "";
    if (content) {
      fullResponse += content;
      // Send each chunk as SSE
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  // Send end signal
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();

  // Extract memory asynchronously after response is sent
  extractMemory(message, fullResponse).catch((error) => {
    console.error("Error in background memory extraction:", error);
  });
}
