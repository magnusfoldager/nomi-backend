import getTravelerState from "./travelerState.ts"

const recommendationTypes = ['food', 'attraction', 'hotel']

export type RecommendationType = typeof recommendationTypes[number];

interface Recommendation {
    id: number;
    title: string;
    type: RecommendationType;
}

export default function getRecommendations() : Recommendation[] {
    return [
        { id: 1, title: 'Recommendation 1', type: 'food' },
        { id: 2, title: 'Recommendation 2', type: 'attraction' },
        { id: 3, title: 'Recommendation 3', type: 'hotel' }
    ]
}