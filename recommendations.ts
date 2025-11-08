import { db } from "./db.js";
import getTravelerState from "./travelerState.js";

const recommendationTypes = ["food", "attraction", "hotel"];

export type RecommendationType = (typeof recommendationTypes)[number];

interface Recommendation {
  id: number;
  title: string;
  type: RecommendationType;
}

export default function getRecommendations(): Recommendation[] {
  const data = db.read();

  const recommendations = db.data.recommendations;

  return recommendations;
}
