import {
  type TravelerDailyState,
  getDefaultTravelerState,
} from "./travelerState.ts";
import { JSONFilePreset } from "lowdb/node";

const defaultTravelerState = getDefaultTravelerState();

const dbTemplate = {
  travelerState: defaultTravelerState,
  recommendations: [] as { id: number; title: string; type: string }[],
  foundFlights: false,
  flight: null as {
    airline: string;
    flightNumber: string;
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    bookingReference: string;
    flightDuration: string;
    flightTerminal: string;
  } | null,
  foundHotels: false,
  hotel: null as {
    hotelName: string;
    address: string;
    checkIn: string;
    checkOut: string;
    bookingReference: string;
    roomType: string;
    numberOfNights: string;
  } | null,
};

export type DbType = typeof dbTemplate;

export const db = await JSONFilePreset("db.json", { ...dbTemplate });
