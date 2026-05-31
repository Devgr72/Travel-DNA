import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destination, duration, budget, traits } = body;

    if (!process.env.GEMINI_API_KEY) {
      // Mock Data
      return NextResponse.json({
        tripData: {
          personalityAnalysis: {
            title: "The Urban Explorer",
            summary: "You thrive in the vibrant energy of the city, seeking out hidden alleys and authentic local experiences.",
            strengths: ["Adaptability", "Curiosity", "Social stamina"]
          },
          wowFactor: {
            hiddenGems: [
              { name: "Local Artist Market", description: "A non-touristy market where actual locals shop." },
              { name: "Underground Cafe", description: "Hard to find, but offers the best local brew." }
            ],
            touristTrapsToAvoid: [
              { name: "Main Square Restaurants", reason: "Overpriced and inauthentic food." }
            ]
          },
          itinerary: {
            days: [
              {
                day: 1,
                title: "Arrival & Orientation",
                activities: [
                  { time: "14:00", description: `Arrive in ${destination} and settle in.`, type: "Logistics" },
                  { time: "16:00", description: "Visit the underground cafe.", type: "Food" },
                  { time: "19:00", description: "Dinner away from the main square.", type: "Food" }
                ]
              }
            ]
          }
        }
      });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
    You are Travel DNA, an advanced AI travel personality engine.
    The user is traveling to ${destination} for ${duration} days with a ${budget} budget.
    Their personality traits (higher = stronger preference):
    ${JSON.stringify(traits, null, 2)}
    
    You must return a valid JSON object matching this exact schema:
    {
      "personalityAnalysis": {
        "title": "<Catchy 2-3 word title, e.g. 'Cultural Explorer'>",
        "summary": "<1-2 sentence summary of their travel style>",
        "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"]
      },
      "wowFactor": {
        "hiddenGems": [
          { "name": "<Underrated Location>", "description": "<Why it fits them>" }
        ],
        "touristTrapsToAvoid": [
          { "name": "<Popular Trap>", "reason": "<Why they specifically would hate it based on their traits>" }
        ]
      },
      "itinerary": {
        "days": [
          {
            "day": <number>,
            "title": "<Catchy Day Title>",
            "activities": [
              {
                "time": "<Time like 09:00 or Morning>",
                "description": "<Detailed activity description>",
                "type": "<One of: Food, Culture, Adventure, Luxury, Social, Exploration, Relaxation, Logistics>"
              }
            ]
          }
        ]
      }
    }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsedData = JSON.parse(text);

    return NextResponse.json({ tripData: parsedData });

  } catch (error) {
    console.error("Error generating trip:", error);
    return NextResponse.json({ error: "Failed to generate trip" }, { status: 500 });
  }
}
