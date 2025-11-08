import client from "./openai.js";
import { db } from "./db.js";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const MemorySchema = z.object({
  hasNewMemory: z.boolean().describe("Whether we learned something new and relevant about the user"),
  memory: z.string().optional().nullable().describe("A single sentence describing what we learned about the user, if anything"),
});

export async function extractMemory(userMessage: string, assistantResponse: string) {
  try {
    const response = await client.responses.parse({
      model: "gpt-5",
      instructions: `You are analyzing a conversation to extract important information about the user that should be remembered for future interactions.

Your goal is to be LIBERAL in saving memories. If there's ANY useful information about the user, save it.

Things to ALWAYS remember:
- Personal preferences (food, drinks, activities, hobbies, interests, dislikes)
- Travel style and habits (budget preferences, how they like to explore, pace)
- Dietary restrictions or allergies
- Important context about their current trip or plans
- Where they're from, where they're going, travel companions
- Their job, schedule, or time constraints
- Feelings, moods, or attitudes they express
- Previous experiences they mention
- Specific places they want to visit or avoid
- Transportation preferences
- Any goals or intentions they express

Only skip saving if:
- It's ALREADY in the existing memories (don't duplicate)
- It's completely generic with no personal info (e.g., "What time is it?")

When you save a memory, write it as a clear, natural sentence in third person (e.g., "The user prefers spicy food" or "The user is traveling with their partner").`,
      input: `User message: "${userMessage}"\n\nAssistant response: "${assistantResponse}"\n\nExisting memories:\n${db.data.memories.map((m, i) => `${i + 1}. ${m}`).join('\n') || 'None yet'}`,
      text: {
        format: zodTextFormat(MemorySchema, "memory_extraction"),
      },
    });

    const result = response.output_parsed;

    if (result?.hasNewMemory && result.memory) {
      // Add the new memory to the database
      db.data.memories.push(result.memory);
      await db.write();
      console.log(`New memory saved: ${result.memory}`);
    }
  } catch (error) {
    console.error("Error extracting memory:", error);
    // Don't throw - memory extraction failures shouldn't break the chat
  }
}
