// [Security] GEMINI_API_KEY read only inside this serverless handler — never client-side.
// [Efficiency] Re-plans only the itinerary portion — does not regenerate wowFactor or personality.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";
import { secureJson } from "@/lib/securityHeaders";
import { AdaptItineraryRequestSchema, AdaptItineraryResponseSchema } from "@/lib/schema";

export async function POST(req: Request) {
  // [Security] Rate limiting
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") ?? "unknown";
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    return secureJson(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  // [Security] Validate request body with Zod
  const parseResult = AdaptItineraryRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parseResult.success) {
    return secureJson({ error: "Invalid request", details: parseResult.error.flatten() }, { status: 400 });
  }
  const { currentItineraryData, context } = parseResult.data;

  if (!process.env.GEMINI_API_KEY) {
    const modifiedDays = currentItineraryData.days.map((day) => ({
      ...day,
      title: day.title + " (Adapted)",
      activities: [
        { time: "Note", description: `ADAPTATION: ${context}`, type: "Logistics" as const },
        ...day.activities,
      ],
    }));
    return secureJson({ updatedItineraryData: { days: modifiedDays } });
  }

  try {
    // [Security] API key read at request time
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
    });

    const prompt = `
You are an expert travel planner. Adapt the itinerary below to accommodate the real-time change.
Rewrite ONLY affected activities — keep unaffected ones unchanged.

Current itinerary:
${JSON.stringify(currentItineraryData, null, 2)}

Change to accommodate: "${context}"

Return ONLY a valid JSON object (no markdown):
{
  "days": [
    {
      "day": <number>,
      "title": "<Day Title>",
      "activities": [
        {
          "time": "<time>",
          "description": "<description>",
          "type": "<Food|Culture|Adventure|Luxury|Social|Exploration|Relaxation|Logistics>",
          "estimatedCostUSD": <number or null>,
          "satisfies": ["<constraint or preference met>"]
        }
      ]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const raw = JSON.parse(result.response.text()) as unknown;

    // [Security] Validate Gemini output before use
    const validated = AdaptItineraryResponseSchema.safeParse(raw);
    if (!validated.success) {
      console.error("Adapt schema mismatch:", validated.error.flatten());
      return secureJson({ error: "AI returned unexpected format" }, { status: 502 });
    }

    return secureJson({ updatedItineraryData: validated.data });
  } catch (error) {
    console.error("Error adapting itinerary:", error);
    return secureJson({ error: "Failed to adapt itinerary" }, { status: 500 });
  }
}
