import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { traits } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        analysis: {
          title: "The Urban Explorer",
          summary: "You thrive in the vibrant energy of the city, seeking out hidden alleys and authentic local experiences.",
          strengths: ["Adaptability", "Curiosity", "Social stamina"]
        }
      });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    Based on the following travel personality traits (higher is stronger):
    ${JSON.stringify(traits, null, 2)}
    
    You must return a valid JSON object analyzing their Travel DNA exactly like this:
    {
      "analysis": {
        "title": "<Catchy 2-3 word title, e.g. 'Cultural Explorer'>",
        "summary": "<2-3 sentences summarizing their unique travel behavioral profile>",
        "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"]
      }
    }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsedData = JSON.parse(text);

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("Error analyzing DNA:", error);
    return NextResponse.json({ error: "Failed to analyze DNA" }, { status: 500 });
  }
}
