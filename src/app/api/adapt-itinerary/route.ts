import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { currentItineraryData, context } = body;

    if (!process.env.GEMINI_API_KEY) {
      // Mock JSON Response
      if (!currentItineraryData || !currentItineraryData.days) {
         return NextResponse.json({ updatedItineraryData: { days: [] } });
      }
      const modifiedDays = currentItineraryData.days.map((day: { title: string, activities: unknown[] }) => {
        return {
          ...day,
          title: day.title + " (Adapted)",
          activities: [
            { time: "Note", description: `*ADAPTATION APPLIED: ${context}*`, type: "Logistics" },
            ...day.activities
          ]
        };
      });
      return NextResponse.json({ updatedItineraryData: { days: modifiedDays } });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
    You are an expert travel planner named Travel DNA. The user has the following structured itinerary:
    ---
    ${JSON.stringify(currentItineraryData, null, 2)}
    ---
    
    A real-time event has occurred or their preference has changed:
    "${context}"
    
    Please REWRITE the itinerary to elegantly accommodate this change. Keep the same exact JSON format:
    {
      "days": [
        {
          "day": <number>,
          "title": "<Catchy Day Title>",
          "activities": [
            {
              "time": "<Morning/Afternoon/Evening or specific time>",
              "description": "<Detailed description of the activity>",
              "type": "<One of: Food, Culture, Adventure, Luxury, Social, Exploration, Relaxation, Logistics>"
            }
          ]
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsedData = JSON.parse(text);

    return NextResponse.json({ updatedItineraryData: parsedData });

  } catch (error) {
    console.error("Error adapting itinerary:", error);
    return NextResponse.json({ error: "Failed to adapt itinerary" }, { status: 500 });
  }
}
