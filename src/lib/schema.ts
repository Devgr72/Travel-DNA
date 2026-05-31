// [Security] Zod schemas for all API inputs and Gemini outputs.
// Validation happens server-side only; malformed payloads return HTTP 400.
import { z } from "zod";

// --- Shared primitive schemas ---

export const TraitsSchema = z.object({
  Adventure: z.number(),
  Food: z.number(),
  Culture: z.number(),
  Luxury: z.number(),
  Social: z.number(),
  Exploration: z.number(),
});

export type Traits = z.infer<typeof TraitsSchema>;

export const ConstraintsSchema = z.object({
  dailyBudgetUSD: z.number().positive().max(10_000).optional(),
  mobility: z.enum(["none", "limited", "wheelchair"]).optional(),
  dietary: z.array(z.string().max(50)).max(10).optional(),
  mustAvoid: z.array(z.string().max(100)).max(10).optional(),
});

export type Constraints = z.infer<typeof ConstraintsSchema>;

// --- Request body schemas ---

export const AnalyzeDnaRequestSchema = z.object({
  traits: TraitsSchema,
});

export const GenerateTripRequestSchema = z.object({
  destination: z.string().min(1).max(200),
  duration: z.union([z.string(), z.number()]),
  budget: z.enum(["Budget", "Moderate", "Luxury"]),
  traits: TraitsSchema.nullable(),
  constraints: ConstraintsSchema.optional(),
});

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

export const ActivitySchema = z.object({
  time: z.string().min(1),
  description: z.string().min(1),
  type: ActivityTypeEnum,
  estimatedCostUSD: z.number().nullable().optional(),
  satisfies: z.array(z.string()).optional(),
  constraintWarning: z.string().optional(),
});

export type Activity = z.infer<typeof ActivitySchema>;

export const DaySchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1),
  activities: z.array(ActivitySchema).min(1),
});

export type Day = z.infer<typeof DaySchema>;

export const ItineraryDataSchema = z.object({
  days: z.array(DaySchema).min(1),
});

export type ItineraryData = z.infer<typeof ItineraryDataSchema>;

export const AdaptItineraryRequestSchema = z.object({
  currentItineraryData: ItineraryDataSchema,
  context: z.string().min(1).max(1_000),
});

// --- Gemini response schemas ([Security] validate model output before use) ---

export const DnaAnalysisResponseSchema = z.object({
  analysis: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    strengths: z.array(z.string()).min(1).max(5),
  }),
});

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

export const AdaptItineraryResponseSchema = z.object({
  days: z.array(DaySchema).min(1),
});
