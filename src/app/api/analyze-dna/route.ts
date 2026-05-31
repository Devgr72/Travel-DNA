// [Security] GEMINI_API_KEY read only inside this serverless handler — never client-side.
// [Efficiency] Identical trait vectors are served from an in-process cache (5 min TTL).
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rateLimit";
import { secureJson } from "@/lib/securityHeaders";
import { AnalyzeDnaRequestSchema, DnaAnalysisResponseSchema } from "@/lib/schema";
import { cacheGet, cacheSet } from "@/lib/responseCache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // [Security] Rate limiting
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") ?? "unknown";
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    return secureJson(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      },
    );
  }

  // [Security] Validate request body with Zod; reject malformed input with 400
  const parseResult = AnalyzeDnaRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parseResult.success) {
    return secureJson(
      { error: "Invalid request", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }
  const { traits } = parseResult.data;

  // [Efficiency] Serve cache hit without calling Gemini
  const cacheKey = `analyze-dna:${JSON.stringify(traits)}`;
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) {
    return secureJson(cached);
  }

  if (!process.env.GEMINI_API_KEY) {
    return secureJson({
      analysis: {
        title: "The Urban Explorer",
        summary:
          "You thrive in vibrant city energy, seeking out hidden alleys and authentic local experiences.",
        strengths: ["Adaptability", "Curiosity", "Social stamina"],
      },
    });
  }

  try {
    // [Security] API key read at request time, not at module load
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
    });

    const prompt = `
Based on these travel personality traits (higher = stronger):
${JSON.stringify(traits, null, 2)}

Return ONLY a valid JSON object — no markdown, no explanation:
{
  "analysis": {
    "title": "<Catchy 2-3 word title>",
    "summary": "<2-3 sentences summarizing their travel behavioral profile>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"]
  }
}`;

    const result = await model.generateContent(prompt);
    const raw = JSON.parse(result.response.text()) as unknown;

    // [Security] Validate Gemini output before use — prevents injection if model misbehaves
    const validated = DnaAnalysisResponseSchema.safeParse(raw);
    if (!validated.success) {
      return secureJson({ error: "AI returned unexpected format" }, { status: 502 });
    }

    // [Efficiency] Cache validated result for subsequent identical requests
    cacheSet(cacheKey, validated.data);
    return secureJson(validated.data);
  } catch (error) {
    console.error("Error analyzing DNA:", error);
    return secureJson({ error: "Failed to analyze DNA" }, { status: 500 });
  }
}
