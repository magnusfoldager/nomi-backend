import client, { ACI_MCP } from "./openai.js";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { db } from "./db.js";

const RecommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.enum(["dining", "attraction", "entertainment", "other"]),
  imageUrl: z.string().describe("URL of an image representing this recommendation"),
  location: z.string().describe("Address or location name of this recommendation"),
});

const RecommendationsResponseSchema = z.object({
  recommendations: z.array(RecommendationSchema),
});

export type RecommendationsResponse = z.infer<
  typeof RecommendationsResponseSchema
>;

function getTimeOfDay(timeString: string): string {
  const hour = parseInt(timeString.split(":")[0]);
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

async function fetchWeather(
  latitude: number,
  longitude: number
): Promise<string> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  console.log(`[fetchWeather] API Key present: ${!!apiKey}`);

  if (!apiKey) {
    console.warn("[fetchWeather] No API key found in environment");
    return "Weather data unavailable";
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
  console.log(`[fetchWeather] Fetching from URL: ${url.replace(apiKey, 'HIDDEN')}`);

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log(`[fetchWeather] Response status: ${response.status}`);
    console.log(`[fetchWeather] Response data:`, data);

    if (!response.ok) {
      console.error(`[fetchWeather] API error: ${data.message || 'Unknown error'}`);
      return "Weather data unavailable";
    }

    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;

    const weatherString = `${temp}°C (feels like ${feelsLike}°C), ${description}, humidity ${humidity}%`;
    console.log(`[fetchWeather] Successfully fetched weather: ${weatherString}`);
    return weatherString;
  } catch (error) {
    console.error("[fetchWeather] Error fetching weather:", error);
    return "Weather data unavailable";
  }
}

export async function generateRecommendations(
  latitude: number,
  longitude: number,
  time: string
): Promise<RecommendationsResponse> {
  console.log(`[generateRecommendations] Called with lat=${latitude}, lon=${longitude}, time=${time}`);
  const timeOfDay = getTimeOfDay(time);
  const travelerState = db.data.travelerState;
  console.log(`[generateRecommendations] Fetching weather...`);
  const weather = await fetchWeather(latitude, longitude);
  console.log(`[generateRecommendations] Weather: ${weather}`);

  const prompt = `Generate 5 personalized recommendations for a traveler at location ${latitude}, ${longitude} during ${timeOfDay}.

Time: ${time}
Weather: ${weather}
Traveler hunger level: ${travelerState.hunger} (0=full, 1=starving)
Traveler tiredness: ${travelerState.tiredness} (0=energetic, 1=exhausted)

For ${timeOfDay}, suggest appropriate activities:
- morning: breakfast places, museums, attractions
- afternoon: lunch spots, activities, sightseeing
- evening: dinner restaurants, entertainment
- night: bars, nightlife, relaxation

Consider their state: ${travelerState.hunger > 0.5 ? "prioritize food options" : ""} ${travelerState.tiredness > 0.7 ? "suggest relaxing activities" : ""}
Consider the weather: if rainy, suggest indoor activities; if sunny, include outdoor options

For each recommendation, search the web to find an appropriate image URL that represents the place or activity.`;

  console.log(`[generateRecommendations] Calling OpenAI API...`);
  const response = await client.responses.parse({
    model: "gpt-5",
    instructions: "Generate location-specific travel recommendations. Use web search to find image URLs for each recommendation.",
    tools: [ACI_MCP, { type: "web_search"}],
    input: prompt,

    text: {
      format: zodTextFormat(RecommendationsResponseSchema, "recommendations"),
    },
  });

  if (!response.output_parsed) {
    console.error("[generateRecommendations] Failed to parse response");
    throw new Error("Failed to generate recommendations");
  }

  console.log(`[generateRecommendations] Got ${response.output_parsed.recommendations.length} recommendations`);

  // Update database
  db.update((data) => {
    data.recommendations = response.output_parsed!.recommendations.map(
      (rec: z.infer<typeof RecommendationSchema>, index: number) => ({
        id: index + 1,
        title: rec.title,
        description: rec.description,
        type: rec.category,
        imageUrl: rec.imageUrl,
        location: rec.location,
      })
    );
    console.log(`[generateRecommendations] Updated DB with ${data.recommendations.length} recommendations`);
    return data;
  });

  return response.output_parsed;
}
