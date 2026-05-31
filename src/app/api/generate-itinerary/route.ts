import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destination, duration, budget, traits } = body;

    if (!process.env.GEMINI_API_KEY) {
      // Mock JSON Response
      return NextResponse.json({
        itineraryData: {
          days: [
            {
              day: 1,
              title: "Arrival and Exploration",
              activities: [
                { time: "Morning", description: `Arrive in ${destination} and check into your accommodation.`, type: "Logistics" },
                { time: "Afternoon", description: "Take a walking tour of the local neighborhood.", type: "Exploration" },
                { time: "Evening", description: "Welcome dinner at a highly-rated local restaurant.", type: "Food" }
              ]
            },
            {
              day: 2,
              title: "Deep Dive into Culture",
              activities: [
                { time: "Morning", description: "Visit the main museum or historical site.", type: "Culture" },
                { time: "Afternoon", description: "Explore the local markets.", type: "Social" },
                { time: "Evening", description: "Relax at a lounge.", type: "Luxury" }
              ]
            }
          ]
        }
      });
    }

    // Using gemini-1.5-flash with JSON mode
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
    You are an expert, highly personalized travel planner called Travel DNA. 
    Create a ${duration}-day travel itinerary for ${destination} with a ${budget} budget.
    
    Tailor the activities explicitly to these specific personality trait scores (higher means stronger preference):
    ${JSON.stringify(traits, null, 2)}
    
    You must return a valid JSON object matching this schema exactly:
    {
      "days": [
        {
          "day": <number>,
          "title": "<Catchy Day Title>",
          "activities": [
            {
              "time": "<Morning/Afternoon/Evening or specific time>",
              "description": "<Detailed description of the activity and why it fits the traits>",
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

    return NextResponse.json({ itineraryData: parsedData });

  } catch (error) {
    console.error("Error generating itinerary:", error);
    return NextResponse.json({ error: "Failed to generate itinerary" }, { status: 500 });
  }
}
