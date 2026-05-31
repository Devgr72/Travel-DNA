/** Pure functions for itinerary parsing, normalisation, and cost estimation. */
import type { Activity, Day, ItineraryData } from "./schema";
import { ItineraryDataSchema } from "./schema";

export type BudgetLevel = "Budget" | "Moderate" | "Luxury";

/** Base USD spend per person per day for each budget tier. */
const BASE_DAILY_COST: Record<BudgetLevel, number> = {
  Budget: 50,
  Moderate: 150,
  Luxury: 400,
};

/** Multiplier applied to the per-activity base cost by activity type. */
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

/**
 * Estimates USD cost for a single activity given the trip's budget tier.
 * Assumes ~4 activities per day to split the daily base rate.
 * @param activity - Activity to price.
 * @param budget   - Trip budget tier.
 * @returns Rounded USD estimate.
 */
export function estimateActivityCost(activity: Activity, budget: BudgetLevel): number {
  const base = BASE_DAILY_COST[budget] / 4;
  const weight = TYPE_COST_WEIGHT[activity.type.toLowerCase()] ?? 1.0;
  return Math.round(base * weight);
}

/**
 * Sums estimated costs for all activities in a single day.
 * @param day    - Day object containing the activity list.
 * @param budget - Trip budget tier.
 * @returns Total estimated USD cost for the day.
 */
export function estimateDayCost(day: Day, budget: BudgetLevel): number {
  return day.activities.reduce((sum, a) => sum + estimateActivityCost(a, budget), 0);
}

/**
 * Sums estimated costs across every day in the itinerary.
 * @param itinerary - Full itinerary data.
 * @param budget    - Trip budget tier.
 * @returns Total estimated USD cost for the trip.
 */
export function estimateTotalTripCost(itinerary: ItineraryData, budget: BudgetLevel): number {
  return itinerary.days.reduce((sum, d) => sum + estimateDayCost(d, budget), 0);
}

/**
 * Validates and normalises raw (possibly malformed) itinerary data.
 * Returns `null` rather than throwing when the structure is invalid —
 * safe to call directly on untyped Gemini output.
 * @param raw - Unknown value to validate.
 * @returns Typed `ItineraryData` on success, or `null` on failure.
 */
export function normalizeItinerary(raw: unknown): ItineraryData | null {
  const result = ItineraryDataSchema.safeParse(raw);
  return result.success ? result.data : null;
}

/**
 * Greedily retains activities whose cumulative cost fits within `dailyBudgetUSD`.
 * Stops including activities once the budget is exhausted for the day.
 * @param day            - Day to filter.
 * @param budget         - Budget tier for cost estimates.
 * @param dailyBudgetUSD - Maximum allowable spend for the day in USD.
 * @returns Filtered activity array.
 */
export function filterAffordableActivities(
  day: Day,
  budget: BudgetLevel,
  dailyBudgetUSD: number,
): Activity[] {
  let spent = 0;
  return day.activities.filter((a) => {
    const cost = estimateActivityCost(a, budget);
    if (spent + cost > dailyBudgetUSD) return false;
    spent += cost;
    return true;
  });
}

/**
 * Returns the day with the most activities; ties go to the first encountered.
 * @param itinerary - Itinerary to inspect.
 * @returns The busiest `Day`, or `null` for an empty itinerary.
 */
export function getBusiestDay(itinerary: ItineraryData): Day | null {
  if (itinerary.days.length === 0) return null;
  return itinerary.days.reduce((best, cur) =>
    cur.activities.length > best.activities.length ? cur : best,
  );
}
