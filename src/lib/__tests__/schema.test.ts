import { describe, it, expect } from "vitest";
import {
  TraitsSchema,
  ConstraintsSchema,
  AnalyzeDnaRequestSchema,
  GenerateTripRequestSchema,
  AdaptItineraryRequestSchema,
  ActivitySchema,
  ItineraryDataSchema,
  DnaAnalysisResponseSchema,
  TripDataResponseSchema,
} from "../schema";

describe("TraitsSchema", () => {
  it("accepts valid trait objects", () => {
    expect(
      TraitsSchema.safeParse({
        Adventure: 5, Food: 3, Culture: 8, Luxury: 1, Social: 2, Exploration: 6,
      }).success
    ).toBe(true);
  });

  it("rejects missing trait keys", () => {
    expect(TraitsSchema.safeParse({ Adventure: 5 }).success).toBe(false);
  });
});

describe("ConstraintsSchema", () => {
  it("accepts empty constraints object", () => {
    expect(ConstraintsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts valid constraints", () => {
    expect(
      ConstraintsSchema.safeParse({
        dailyBudgetUSD: 100,
        mobility: "limited",
        dietary: ["vegetarian"],
        mustAvoid: ["casinos"],
      }).success
    ).toBe(true);
  });

  it("rejects negative dailyBudgetUSD", () => {
    expect(ConstraintsSchema.safeParse({ dailyBudgetUSD: -50 }).success).toBe(false);
  });

  it("rejects invalid mobility values", () => {
    expect(ConstraintsSchema.safeParse({ mobility: "invalid" }).success).toBe(false);
  });
});

describe("AnalyzeDnaRequestSchema", () => {
  it("accepts a valid DNA request", () => {
    expect(
      AnalyzeDnaRequestSchema.safeParse({
        traits: { Adventure: 5, Food: 3, Culture: 8, Luxury: 1, Social: 2, Exploration: 6 },
      }).success
    ).toBe(true);
  });

  it("rejects requests with missing traits", () => {
    expect(AnalyzeDnaRequestSchema.safeParse({}).success).toBe(false);
  });
});

describe("GenerateTripRequestSchema", () => {
  const valid = {
    destination: "Tokyo",
    duration: 5,
    budget: "Moderate" as const,
    traits: { Adventure: 5, Food: 3, Culture: 8, Luxury: 1, Social: 2, Exploration: 6 },
  };

  it("accepts a valid generate trip request", () => {
    expect(GenerateTripRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty destination", () => {
    expect(GenerateTripRequestSchema.safeParse({ ...valid, destination: "" }).success).toBe(false);
  });

  it("rejects invalid budget values", () => {
    expect(GenerateTripRequestSchema.safeParse({ ...valid, budget: "Expensive" }).success).toBe(false);
  });

  it("accepts null traits (no quiz taken)", () => {
    expect(GenerateTripRequestSchema.safeParse({ ...valid, traits: null }).success).toBe(true);
  });

  it("accepts optional constraints", () => {
    expect(
      GenerateTripRequestSchema.safeParse({ ...valid, constraints: { dailyBudgetUSD: 200 } }).success
    ).toBe(true);
  });
});

describe("ActivitySchema", () => {
  const validActivity = { time: "09:00", description: "Morning hike", type: "Adventure" as const };

  it("accepts valid activity", () => {
    expect(ActivitySchema.safeParse(validActivity).success).toBe(true);
  });

  it("rejects invalid type", () => {
    expect(ActivitySchema.safeParse({ ...validActivity, type: "Surfing" }).success).toBe(false);
  });

  it("rejects missing description", () => {
    expect(ActivitySchema.safeParse({ time: "09:00", type: "Food" }).success).toBe(false);
  });

  it("accepts optional satisfies array", () => {
    expect(
      ActivitySchema.safeParse({ ...validActivity, satisfies: ["Adventure preference"] }).success
    ).toBe(true);
  });
});

describe("ItineraryDataSchema", () => {
  it("rejects an empty days array", () => {
    expect(ItineraryDataSchema.safeParse({ days: [] }).success).toBe(false);
  });

  it("rejects days with empty activities", () => {
    expect(
      ItineraryDataSchema.safeParse({ days: [{ day: 1, title: "Day 1", activities: [] }] }).success
    ).toBe(false);
  });

  it("accepts valid itinerary data", () => {
    expect(
      ItineraryDataSchema.safeParse({
        days: [{ day: 1, title: "Day 1", activities: [{ time: "09:00", description: "Walk", type: "Exploration" }] }],
      }).success
    ).toBe(true);
  });
});

describe("AdaptItineraryRequestSchema", () => {
  const validItinerary = {
    days: [{ day: 1, title: "Day 1", activities: [{ time: "09:00", description: "Walk", type: "Exploration" as const }] }],
  };

  it("accepts valid adapt request", () => {
    expect(
      AdaptItineraryRequestSchema.safeParse({
        currentItineraryData: validItinerary,
        context: "Heavy rain started",
      }).success
    ).toBe(true);
  });

  it("rejects empty context string", () => {
    expect(
      AdaptItineraryRequestSchema.safeParse({ currentItineraryData: validItinerary, context: "" }).success
    ).toBe(false);
  });

  it("rejects context over 1000 characters", () => {
    expect(
      AdaptItineraryRequestSchema.safeParse({
        currentItineraryData: validItinerary,
        context: "x".repeat(1001),
      }).success
    ).toBe(false);
  });
});

describe("DnaAnalysisResponseSchema", () => {
  it("accepts valid Gemini DNA response", () => {
    expect(
      DnaAnalysisResponseSchema.safeParse({
        analysis: { title: "Urban Explorer", summary: "You love cities.", strengths: ["Curious"] },
      }).success
    ).toBe(true);
  });

  it("rejects response missing summary", () => {
    expect(
      DnaAnalysisResponseSchema.safeParse({ analysis: { title: "X", strengths: ["A"] } }).success
    ).toBe(false);
  });
});

describe("TripDataResponseSchema", () => {
  it("rejects malformed Gemini trip output", () => {
    expect(TripDataResponseSchema.safeParse({ personalityAnalysis: null }).success).toBe(false);
  });

  it("rejects itinerary with over-constrained empty activities", () => {
    expect(
      TripDataResponseSchema.safeParse({
        personalityAnalysis: { title: "X", summary: "Y", strengths: ["A"] },
        wowFactor: { hiddenGems: [], touristTrapsToAvoid: [] },
        itinerary: { days: [{ day: 1, title: "D1", activities: [] }] },
      }).success
    ).toBe(false);
  });
});
