import { type TravelerDailyState, getDefaultTravelerState } from './travelerState.ts';
import { JSONFilePreset } from 'lowdb/node'

const defaultTravelerState = getDefaultTravelerState();

const dbTemplate = {
    travelerState: defaultTravelerState,
    recommendations: [] as { id: number; title: string; type: string }[],
    userInputString: "",
}

export type DbType = typeof dbTemplate

export const db = await JSONFilePreset('db.json', { ...dbTemplate })