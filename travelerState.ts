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

//TODO: Implement GPT logic for estimating traveler state

export default function getTravelerState(): TravelerDailyState {
  return {
    tiredness: 0.5,
    hunger: 0.3,
    sociability: 0.7,
    adventurousness: 0.6,
    curiosity: 0.8,
    stressLevel: 0.4,
    spendingWillingness: 0.5,
    safetyFeeling: 0.9,
    spontaneity: 0.6,
    patience: 0.7
  };
}