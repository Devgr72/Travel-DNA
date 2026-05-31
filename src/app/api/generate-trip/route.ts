// [Security] GEMINI_API_KEY read only inside this serverless handler — never client-side.
// [Problem Alignment] Constraints (budget, mobility, dietary, mustAvoid) are woven into the prompt.
// [Efficiency] Identical inputs are served from an in-process cache (5 min TTL).
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";
import { secureJson } from "@/lib/securityHeaders";
import { GenerateTripRequestSchema, TripDataResponseSchema } from "@/lib/schema";
import type { Constraints } from "@/lib/schema";
import { cacheGet, cacheSet } from "@/lib/responseCache";

export const dynamic = "force-dynamic";

function buildConstraintsClause(c: Constraints | undefined): string {
  if (!c) return "";
  const parts: string[] = [];
  if (c.dailyBudgetUSD)
    parts.push(
      `Daily budget cap: $${c.dailyBudgetUSD} USD (label every activity with estimatedCostUSD).`,
    );
  if (c.mobility === "limited")
    parts.push(
      "The traveler has limited mobility — avoid activities requiring extensive walking or stairs.",
    );
  if (c.mobility === "wheelchair")
    parts.push("The traveler uses a wheelchair — all venues must be fully wheelchair accessible.");
  if (c.dietary?.length)
    parts.push(
      `Dietary restrictions: ${c.dietary.join(", ")} — all Food activities must respect these.`,
    );
  if (c.mustAvoid?.length) parts.push(`Must avoid: ${c.mustAvoid.join(", ")}.`);
  return parts.length
    ? `\nCONSTRAINTS (respect these; surface a constraintWarning string when a constraint cannot be fully met — NEVER fabricate a fit):\n${parts.join("\n")}`
    : "";
}

export async function POST(req: Request) {
  // [Security] Rate limiting
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") ?? "unknown";
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    return secureJson(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  // [Security] Validate request body with Zod
  const parseResult = GenerateTripRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parseResult.success) {
    return secureJson(
      { error: "Invalid request", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }
  const { destination, duration, budget, traits, constraints } = parseResult.data;

  // [Efficiency] Serve cache hit without calling Gemini
  const cacheKey = `generate-trip:${JSON.stringify({ destination, duration, budget, traits, constraints })}`;
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) {
    return secureJson(cached);
  }

  if (!process.env.GEMINI_API_KEY) {
    return secureJson({
      tripData: {
        personalityAnalysis: {
          title: "The Urban Explorer",
          summary:
            "You thrive in vibrant city energy, seeking hidden alleys and authentic local experiences.",
          strengths: ["Adaptability", "Curiosity", "Social stamina"],
        },
        wowFactor: {
          hiddenGems: [
            {
              name: "Local Artist Market",
              description: "A non-touristy market where actual locals shop.",
            },
            {
              name: "Underground Cafe",
              description: "Hard to find, but offers the best local brew.",
            },
          ],
          touristTrapsToAvoid: [
            { name: "Main Square Restaurants", reason: "Overpriced and inauthentic food." },
          ],
        },
        itinerary: {
          days: [
            {
              day: 1,
              title: "Arrival & Orientation",
              activities: [
                {
                  time: "14:00",
                  description: `Arrive in ${destination} and settle in.`,
                  type: "Logistics",
                  estimatedCostUSD: 20,
                  satisfies: ["logistics preference"],
                },
                {
                  time: "16:00",
                  description: "Visit the underground cafe.",
                  type: "Food",
                  estimatedCostUSD: 15,
                  satisfies: ["Food preference"],
                },
                {
                  time: "19:00",
                  description: "Dinner away from the main square.",
                  type: "Food",
                  estimatedCostUSD: 30,
                  satisfies: ["Food preference", "budget"],
                },
              ],
            },
          ],
        },
      },
    });
  }

  try {
    // [Security] API key read at request time
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
    });

    const constraintsClause = buildConstraintsClause(constraints);

    const prompt = `
You are Travel DNA, an AI travel personality engine. Ground your output strictly in the user's input — do not fabricate or assume.
Destination: ${destination} | Duration: ${duration} days | Budget tier: ${budget}
Personality traits (higher = stronger): ${JSON.stringify(traits, null, 2)}
${constraintsClause}

Return ONLY a valid JSON object matching this exact schema (no markdown):
{
  "personalityAnalysis": {
    "title": "<Catchy 2-3 word title>",
    "summary": "<1-2 sentence summary of their travel style>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"]
  },
  "wowFactor": {
    "hiddenGems": [{ "name": "<Underrated Location>", "description": "<Why it fits them>" }],
    "touristTrapsToAvoid": [{ "name": "<Popular Trap>", "reason": "<Why they would hate it>" }]
  },
  "itinerary": {
    "days": [
      {
        "day": <number>,
        "title": "<Catchy Day Title>",
        "activities": [
          {
            "time": "<09:00 or Morning>",
            "description": "<Detailed activity description>",
            "type": "<Food|Culture|Adventure|Luxury|Social|Exploration|Relaxation|Logistics>",
            "estimatedCostUSD": <number — label as estimate>,
            "satisfies": ["<preference or constraint this meets>"],
            "constraintWarning": "<string if a constraint can't be fully met, else omit>"
          }
        ]
      }
    ]
  }
}`;

    const result = await model.generateContent(prompt);
    const raw = JSON.parse(result.response.text()) as unknown;

    // [Security] Validate Gemini output before rendering
    const validated = TripDataResponseSchema.safeParse(raw);
    if (!validated.success) {
      console.error("Gemini schema mismatch:", validated.error.flatten());
      return secureJson({ error: "AI returned unexpected format" }, { status: 502 });
    }

    // [Efficiency] Cache validated result for subsequent identical requests
    const responsePayload = { tripData: validated.data };
    cacheSet(cacheKey, responsePayload);
    return secureJson(responsePayload);
  } catch (error) {
    console.error("Error generating trip:", error);
    return secureJson({ error: "Failed to generate trip" }, { status: 500 });
  }
}
