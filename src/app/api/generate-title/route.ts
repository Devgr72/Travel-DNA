import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { traits } = body;

    if (!process.env.GEMINI_API_KEY) {
      // Mock Title based on max trait
      let maxTrait = "Explorer";
      let maxVal = -1;
      for (const [key, val] of Object.entries(traits || {})) {
        if ((val as number) > maxVal) {
          maxVal = val as number;
          maxTrait = key;
        }
      }
      return NextResponse.json({ title: `The ${maxTrait} Traveler` });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Based on the following travel personality traits (higher is stronger):
    ${JSON.stringify(traits, null, 2)}
    
    Generate a 2-3 word catchy, premium "Traveler Archetype" title for this person.
    For example: "The Cultured Epicurean", "The Urban Explorer", "The Luxury Thrillseeker".
    Return ONLY the title, no quotes or extra text.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return NextResponse.json({ title: text });

  } catch (error) {
    console.error("Error generating title:", error);
    return NextResponse.json({ error: "Failed to generate title" }, { status: 500 });
  }
}
