// [Testing] Pure functions for itinerary parsing, normalization, and cost estimation.
import type { Activity, Day, ItineraryData } from "./schema";
import { ItineraryDataSchema } from "./schema";

export type BudgetLevel = "Budget" | "Moderate" | "Luxury";

const BASE_DAILY_COST: Record<BudgetLevel, number> = {
  Budget: 50,
  Moderate: 150,
  Luxury: 400,
};

const TYPE_COST_WEIGHT: Record<string, number> = {
  food: 1.2,
  culture: 0.7,
  adventure: 1.4,
  luxury: 2.2,
  social: 0.5,
  exploration: 0.4,
  relaxation: 1.0,
  logistics: 0.3,
};

/** Estimates USD cost for a single activity based on budget tier. */
export function estimateActivityCost(activity: Activity, budget: BudgetLevel): number {
  const base = BASE_DAILY_COST[budget] / 4; // split by ~4 activities/day
  const weight = TYPE_COST_WEIGHT[activity.type.toLowerCase()] ?? 1.0;
  return Math.round(base * weight);
}

/** Sums estimated costs for all activities in a day. */
export function estimateDayCost(day: Day, budget: BudgetLevel): number {
  return day.activities.reduce((sum, a) => sum + estimateActivityCost(a, budget), 0);
}

/** Sums estimated costs across the entire itinerary. */
export function estimateTotalTripCost(itinerary: ItineraryData, budget: BudgetLevel): number {
  return itinerary.days.reduce((sum, d) => sum + estimateDayCost(d, budget), 0);
}

/**
 * Validates and normalizes raw itinerary data.
 * Returns null when the structure is invalid rather than throwing.
 */
export function normalizeItinerary(raw: unknown): ItineraryData | null {
  const result = ItineraryDataSchema.safeParse(raw);
  return result.success ? result.data : null;
}

/** Returns activities that a daily-budget constraint covers, given the estimate. */
export function filterAffordableActivities(
  day: Day,
  budget: BudgetLevel,
  dailyBudgetUSD: number
): Activity[] {
  let spent = 0;
  return day.activities.filter((a) => {
    const cost = estimateActivityCost(a, budget);
    if (spent + cost > dailyBudgetUSD) return false;
    spent += cost;
    return true;
  });
}

/** Returns the day with the most activities (useful for test assertions). */
export function getBusiestDay(itinerary: ItineraryData): Day | null {
  if (itinerary.days.length === 0) return null;
  return itinerary.days.reduce((best, cur) =>
    cur.activities.length > best.activities.length ? cur : best
  );
}
