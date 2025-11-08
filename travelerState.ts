import { db } from "./db.js";
import client from "./openai.js";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

/**
 * Defines the core parameters of a traveler's state,
 * with each value normalized from 0.0 to 1.0.
 */
export interface TravelerDailyState {
  /** * How physically tired the traveler is.
   * 0.0: Fully rested and energetic.
   * 1.0: Completely exhausted.
   */
  tiredness: number;

  /** * The traveler's level of hunger.
   * 0.0: Completely full.
   * 1.0: Starving.
   */
  hunger: number;

  /** * Desire for social interaction.
   * 0.0: Wants to be completely alone.
   * 1.0: Craves social connection and meeting new people.
   */
  sociability: number;

  /** * Desire for new, novel, or high-octane experiences.
   * 0.0: Prefers comfort, familiarity, and safety.
   * 1.0: Craves adventure, risk, and novelty.
   */
  adventurousness: number;

  /** * Desire to learn, explore, and be mentally stimulated.
   * 0.0: Indifferent, not in a learning mood.
   * 1.0: Highly curious and eager to learn.
   */
  curiosity: number;

  /** * Current level of mental strain.
   * 0.0: Completely calm and relaxed.
   * 1.0: Highly stressed, anxious, or overwhelmed.
   */
  stressLevel: number;

  /** * How willing the traveler is to spend money.
   * 0.0: Extremely frugal, trying to save.
   * 1.0: Ready to splurge.
   */
  spendingWillingness: number;

  /** * How safe the traveler feels in their current environment.
   * 0.0: Feels very unsafe or on-edge.
   * 1.0: Feels completely safe and secure.
   */
  safetyFeeling: number;

  /** * Openness to deviating from a set plan.
   * 0.0: Wants to stick to the itinerary exactly.
   * 1.0: Completely open to spontaneous changes.
   */
  spontaneity: number;

  /** * Current level of patience for delays, crowds, or problems.
   * 0.0: No patience, easily frustrated.
   * 1.0: Very patient and tolerant.
   */
  patience: number;
}

export function llmGetTravelerStatePrompt(
  recentActivities: string,
  recentUserInput: string
): string {
  return `
  You are an expert travel assistant AI. Based on the traveler's recent activities and the manual input they've supplied, preferences, and context, provide an updated assessment of their current TravelerDailyState.

  Respond in JSON format with the following fields AND NOTHING ELSE, each normalized from 0.0 to 1.0:
  - tiredness
  - hunger
  - sociability
  - adventurousness
  - curiosity
  - stressLevel
  - spendingWillingness
  - safetyFeeling
  - spontaneity
  - patience

  e.g. {
    "tiredness": 0.5,
    "hunger": 0.3,
    "sociability": 0.7,
    "adventurousness": 0.6,
    "curiosity": 0.8,
    "stressLevel": 0.4,
    "spendingWillingness": 0.5,
    "safetyFeeling": 0.9,
    "spontaneity": 0.6,
    "patience": 0.7
  }

  Ensure the values accurately reflect the traveler's current state.

  --------------- START CURRENT TRAVELER STATE ---------------
  ${JSON.stringify(db.data.travelerState, null, 2)}
  --------------- END CURRENT TRAVELER STATE ---------------

  --------------- START RECENT ACTIVITIES ---------------
  ${recentActivities}
  --------------- END RECENT ACTIVITIES ---------------

  --------------- START MOST RECENT USER INPUT ---------------
  ${recentUserInput}
  --------------- END MOST RECENT USER INPUT ---------------
  `;
}

export default function getTravelerState(): TravelerDailyState {
  return db.data.travelerState;
}

export function updateTravelerState(
  recentActivities?: string,
  recentUserInput?: string
) {
  const travelerState = db.data.travelerState;

  if (!recentActivities) {
    recentActivities = "No recent activities provided.";
  }
  if (!recentUserInput) {
    recentUserInput = "No recent user input provided.";
  }

  const prompt = llmGetTravelerStatePrompt(recentActivities, recentUserInput);
  getUserStateFromAI(prompt).then((newState) => {
    if (newState) {
      db.data.travelerState = newState as TravelerDailyState;
      db.write();
    }
  });
}

export function getDefaultTravelerState(): TravelerDailyState {
  return {
    tiredness: 0.5,
    hunger: 0.5,
    sociability: 0.5,
    adventurousness: 0.5,
    curiosity: 0.5,
    stressLevel: 0.5,
    spendingWillingness: 0.5,
    safetyFeeling: 0.5,
    spontaneity: 0.5,
    patience: 0.5,
  };
}

async function getUserStateFromAI(prompt: string) {
  const userStateSchema = z
    .object({
      tiredness: z
        .number()
        .min(0)
        .max(1)
        .describe("User's current tiredness, 0=rested, 1=exhausted"),
      hunger: z
        .number()
        .min(0)
        .max(1)
        .describe("User's current hunger, 0=full, 1=starving"),
      sociability: z
        .number()
        .min(0)
        .max(1)
        .describe("Desire for social interaction, 0=none, 1=high"),
      adventurousness: z
        .number()
        .min(0)
        .max(1)
        .describe("Willingness to try new things, 0=cautious, 1=daring"),
      curiosity: z
        .number()
        .min(0)
        .max(1)
        .describe("Desire to learn or explore, 0=indifferent, 1=curious"),
      stressLevel: z
        .number()
        .min(0)
        .max(1)
        .describe("Current stress, 0=calm, 1=high-stress"),
      spendingWillingness: z
        .number()
        .min(0)
        .max(1)
        .describe("Willingness to spend money, 0=frugal, 1=generous"),
      safetyFeeling: z
        .number()
        .min(0)
        .max(1)
        .describe("Current feeling of safety, 0=unsafe, 1=very safe"),
      spontaneity: z
        .number()
        .min(0)
        .max(1)
        .describe("Desire for spontaneous action, 0=planner, 1=spontaneous"),
      patience: z
        .number()
        .min(0)
        .max(1)
        .describe("Current patience level, 0=impatient, 1=patient"),
    })
    .describe("A profile of the user's current psycho-physiological state.");

  const response = await client.responses.parse({
    model: "gpt-5",
    instructions: prompt,
    input: "Determine the traveler's state based on the instructions.",
    text: {
      format: zodTextFormat(userStateSchema, "userState"),
    },
  });

  console.log("Traveler State LLM Response:", response);

  if (!response.output_parsed) {
    return false;
  }

  if (response.output_parsed) {
    db.update((db) => {
      db.travelerState = response.output_parsed!;
      return db;
    });
    return response.output_parsed;
  }
}
