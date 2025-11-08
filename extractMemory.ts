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
      instructions: `You are analyzing a conversation to determine if we learned something new and relevant about the user.

Review the user's message and the assistant's response. Determine if there is any NEW information about the user that should be remembered for future conversations.

Things to remember:
- Personal preferences (food, activities, travel style)
- Important context about their trip or situation
- Specific needs or constraints
- Personal background or circumstances

Things NOT to remember:
- Temporary states or one-time questions
- General chitchat
- Information already covered in existing memories

Return hasNewMemory as true if there's something to remember, false otherwise. If hasNewMemory is true, provide the memory as a single clear, concise sentence.`,
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
