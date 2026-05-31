import { describe, it, expect } from "vitest";
import {
  estimateActivityCost,
  estimateDayCost,
  estimateTotalTripCost,
  normalizeItinerary,
  filterAffordableActivities,
  getBusiestDay,
} from "../itinerary";
import type { Activity, Day, ItineraryData } from "../schema";

const food: Activity = { time: "12:00", description: "Lunch", type: "Food" };
const adventure: Activity = { time: "14:00", description: "Hike", type: "Adventure" };
const logistics: Activity = { time: "08:00", description: "Travel", type: "Logistics" };

const day1: Day = { day: 1, title: "Day One", activities: [food, adventure, logistics] };
const day2: Day = { day: 2, title: "Day Two", activities: [food] };
const itinerary: ItineraryData = { days: [day1, day2] };

describe("estimateActivityCost", () => {
  it("returns a positive number for Budget tier", () => {
    expect(estimateActivityCost(food, "Budget")).toBeGreaterThan(0);
  });

  it("Luxury tier costs more than Budget tier", () => {
    expect(estimateActivityCost(adventure, "Luxury")).toBeGreaterThan(
      estimateActivityCost(adventure, "Budget"),
    );
  });

  it("Adventure type has higher weight than Logistics type", () => {
    expect(estimateActivityCost(adventure, "Moderate")).toBeGreaterThan(
      estimateActivityCost(logistics, "Moderate"),
    );
  });
});

describe("estimateDayCost", () => {
  it("sums all activity costs for the day", () => {
    const sum = [food, adventure, logistics].reduce(
      (acc, a) => acc + estimateActivityCost(a, "Budget"),
      0,
    );
    expect(estimateDayCost(day1, "Budget")).toBe(sum);
  });

  it("returns 0 for a day with no activities", () => {
    const emptyDay: Day = { day: 3, title: "Empty", activities: [] };
    expect(estimateDayCost(emptyDay, "Moderate")).toBe(0);
  });
});

describe("estimateTotalTripCost", () => {
  it("sums all day costs", () => {
    const expected = estimateDayCost(day1, "Moderate") + estimateDayCost(day2, "Moderate");
    expect(estimateTotalTripCost(itinerary, "Moderate")).toBe(expected);
  });

  it("returns 0 for an empty itinerary (no days)", () => {
    expect(estimateTotalTripCost({ days: [] }, "Budget")).toBe(0);
  });
});

describe("normalizeItinerary", () => {
  it("returns the parsed itinerary for valid input", () => {
    const result = normalizeItinerary(itinerary);
    expect(result).not.toBeNull();
    expect(result?.days).toHaveLength(2);
  });

  it("returns null for null input", () => {
    expect(normalizeItinerary(null)).toBeNull();
  });

  it("returns null for malformed model output (missing days array)", () => {
    expect(normalizeItinerary({ notDays: [] })).toBeNull();
  });

  it("returns null for a string input", () => {
    expect(normalizeItinerary("invalid")).toBeNull();
  });

  it("returns null when days contain invalid activity types", () => {
    const malformed = {
      days: [
        {
          day: 1,
          title: "X",
          activities: [{ time: "9am", description: "swim", type: "INVALID_TYPE" }],
        },
      ],
    };
    expect(normalizeItinerary(malformed)).toBeNull();
  });

  it("returns null for an empty activities array within a day", () => {
    const noActivities = { days: [{ day: 1, title: "Day", activities: [] }] };
    expect(normalizeItinerary(noActivities)).toBeNull();
  });
});

describe("filterAffordableActivities", () => {
  it("includes activities within daily budget", () => {
    const result = filterAffordableActivities(day1, "Budget", 1000);
    expect(result.length).toBeGreaterThan(0);
  });

  it("excludes activities that exceed the daily budget", () => {
    const result = filterAffordableActivities(day1, "Budget", 0);
    expect(result).toHaveLength(0);
  });
});

describe("getBusiestDay", () => {
  it("returns the day with the most activities", () => {
    const result = getBusiestDay(itinerary);
    expect(result?.day).toBe(1); // day1 has 3 activities vs day2's 1
  });

  it("returns null for an empty itinerary", () => {
    expect(getBusiestDay({ days: [] })).toBeNull();
  });
});
