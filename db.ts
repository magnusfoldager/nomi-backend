import {
  type TravelerDailyState,
  getDefaultTravelerState,
} from "./travelerState.js";
import { JSONFilePreset } from "lowdb/node";

const defaultTravelerState = getDefaultTravelerState();

const dbTemplate = {
  travelerState: defaultTravelerState,
  recommendations: [] as { id: number; title: string; type: string }[],
  userInputString: "",
  foundFlights: false,
  foundHotels: false,
  flights: [] as {
    airline: string;
    flightNumber: string;
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    bookingReference: string;
    flightDuration: string;
    flightTerminal: string;
  }[],
  hotels: [] as {
    hotelName: string;
    address: string;
    checkIn: string;
    checkOut: string;
    bookingReference: string;
    roomType: string;
    numberOfNights: string;
  }[],
};

export type DbType = typeof dbTemplate;

export const db = await JSONFilePreset("db.json", { ...dbTemplate });
