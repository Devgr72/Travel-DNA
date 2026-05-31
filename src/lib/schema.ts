/**
 * Zod schemas for all API request bodies and Gemini response shapes.
 * Validation is server-side only; malformed payloads are rejected with HTTP 400
 * before reaching any AI call, and model output is validated before rendering.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared primitive schemas
// ---------------------------------------------------------------------------

/** Six-dimension trait vector produced by the behavioral quiz. */
export const TraitsSchema = z.object({
  Adventure: z.number(),
  Food: z.number(),
  Culture: z.number(),
  Luxury: z.number(),
  Social: z.number(),
  Exploration: z.number(),
});

export type Traits = z.infer<typeof TraitsSchema>;

/** Optional hard constraints the user sets before generating a trip. */
export const ConstraintsSchema = z.object({
  dailyBudgetUSD: z.number().positive().max(10_000).optional(),
  mobility: z.enum(["none", "limited", "wheelchair"]).optional(),
  dietary: z.array(z.string().max(50)).max(10).optional(),
  mustAvoid: z.array(z.string().max(100)).max(10).optional(),
});

export type Constraints = z.infer<typeof ConstraintsSchema>;

// ---------------------------------------------------------------------------
// API request body schemas
// ---------------------------------------------------------------------------

/** POST /api/analyze-dna — trait vector from the completed quiz. */
export const AnalyzeDnaRequestSchema = z.object({
  traits: TraitsSchema,
});

/** POST /api/generate-trip — full trip generation parameters. */
export const GenerateTripRequestSchema = z.object({
  destination: z.string().min(1).max(200),
  duration: z.union([z.string(), z.number()]),
  budget: z.enum(["Budget", "Moderate", "Luxury"]),
  traits: TraitsSchema.nullable(),
  constraints: ConstraintsSchema.optional(),
});

/** Enumeration of valid activity type labels. */
export const ActivityTypeEnum = z.enum([
  "Food",
  "Culture",
  "Adventure",
  "Luxury",
  "Social",
  "Exploration",
  "Relaxation",
  "Logistics",
]);

export type ActivityType = z.infer<typeof ActivityTypeEnum>;

/** Single time-stamped activity within a day. */
export const ActivitySchema = z.object({
  time: z.string().min(1),
  description: z.string().min(1),
  type: ActivityTypeEnum,
  estimatedCostUSD: z.number().nullable().optional(),
  satisfies: z.array(z.string()).optional(),
  constraintWarning: z.string().optional(),
});

export type Activity = z.infer<typeof ActivitySchema>;

/** One day of the itinerary; must contain at least one activity. */
export const DaySchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1),
  activities: z.array(ActivitySchema).min(1),
});

export type Day = z.infer<typeof DaySchema>;

/** Complete itinerary — must contain at least one day. */
export const ItineraryDataSchema = z.object({
  days: z.array(DaySchema).min(1),
});

export type ItineraryData = z.infer<typeof ItineraryDataSchema>;

/** POST /api/adapt-itinerary — current itinerary plus a real-world change context. */
export const AdaptItineraryRequestSchema = z.object({
  currentItineraryData: ItineraryDataSchema,
  context: z.string().min(1).max(1_000),
});

// ---------------------------------------------------------------------------
// Gemini response schemas — validate model output before use
// ---------------------------------------------------------------------------

/** Expected shape of a /api/analyze-dna Gemini response. */
export const DnaAnalysisResponseSchema = z.object({
  analysis: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    strengths: z.array(z.string()).min(1).max(5),
  }),
});

/** Expected shape of a /api/generate-trip Gemini response. */
export const TripDataResponseSchema = z.object({
  personalityAnalysis: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    strengths: z.array(z.string()).min(1).max(5),
  }),
  wowFactor: z.object({
    hiddenGems: z.array(z.object({ name: z.string(), description: z.string() })),
    touristTrapsToAvoid: z.array(z.object({ name: z.string(), reason: z.string() })),
  }),
  itinerary: ItineraryDataSchema,
});

export type TripData = z.infer<typeof TripDataResponseSchema>;

/** Expected shape of a /api/adapt-itinerary Gemini response. */
export const AdaptItineraryResponseSchema = z.object({
  days: z.array(DaySchema).min(1),
});
