import { describe, it, expect } from "vitest";
import {
  isOutdoorActivity,
  indoorAlternativeFor,
  swapOutdoorToIndoor,
  countOutdoorActivities,
  replanForRain,
} from "../weather";
import type { Activity } from "../schema";

const adventure: Activity = { time: "10:00", description: "Mountain hike", type: "Adventure" };
const exploration: Activity = { time: "14:00", description: "City walk", type: "Exploration" };
const food: Activity = { time: "12:00", description: "Street food", type: "Food" };
const culture: Activity = { time: "16:00", description: "Museum visit", type: "Culture" };
const logistics: Activity = { time: "08:00", description: "Transfer", type: "Logistics" };

describe("isOutdoorActivity", () => {
  it("returns true for Adventure type", () => {
    expect(isOutdoorActivity(adventure)).toBe(true);
  });

  it("returns true for Exploration type", () => {
    expect(isOutdoorActivity(exploration)).toBe(true);
  });

  it("returns false for Food type", () => {
    expect(isOutdoorActivity(food)).toBe(false);
  });

  it("returns false for Culture type", () => {
    expect(isOutdoorActivity(culture)).toBe(false);
  });

  it("returns false for Logistics type", () => {
    expect(isOutdoorActivity(logistics)).toBe(false);
  });
});

describe("indoorAlternativeFor", () => {
  it("returns a string for adventure", () => {
    expect(typeof indoorAlternativeFor("adventure")).toBe("string");
    expect(indoorAlternativeFor("adventure").length).toBeGreaterThan(0);
  });

  it("returns a fallback for unknown types", () => {
    expect(indoorAlternativeFor("unknown")).toBe("indoor alternative");
  });

  it("is case-insensitive", () => {
    expect(indoorAlternativeFor("ADVENTURE")).toBe(indoorAlternativeFor("adventure"));
  });
});

describe("swapOutdoorToIndoor", () => {
  it("replaces outdoor activities with adapted descriptions", () => {
    const result = swapOutdoorToIndoor([adventure, food], "heavy rain");
    expect(result[0].description).toContain("heavy rain");
    expect(result[1]).toBe(food); // unchanged
  });

  it("does not mutate the original array", () => {
    const original = [adventure, food];
    swapOutdoorToIndoor(original, "storm");
    expect(original[0].description).toBe("Mountain hike");
  });

  it("keeps non-outdoor activities unchanged", () => {
    const result = swapOutdoorToIndoor([culture, logistics], "snow");
    expect(result[0]).toBe(culture);
    expect(result[1]).toBe(logistics);
  });

  it("changes the type of swapped outdoor activities", () => {
    const result = swapOutdoorToIndoor([adventure], "storm");
    expect(result[0].type).not.toBe("Adventure");
  });

  it("handles an empty activities array", () => {
    expect(swapOutdoorToIndoor([], "rain")).toEqual([]);
  });

  it("handles an all-outdoor day under rain", () => {
    const result = swapOutdoorToIndoor([adventure, exploration], "rain");
    expect(result.every((a) => !isOutdoorActivity(a))).toBe(true);
  });
});

describe("countOutdoorActivities", () => {
  it("counts outdoor activities correctly", () => {
    expect(countOutdoorActivities([adventure, food, exploration])).toBe(2);
  });

  it("returns 0 when no outdoor activities", () => {
    expect(countOutdoorActivities([food, culture])).toBe(0);
  });

  it("returns 0 for an empty array", () => {
    expect(countOutdoorActivities([])).toBe(0);
  });
});

describe("replanForRain", () => {
  it("prepends a Logistics note when outdoor activities exist", () => {
    const result = replanForRain([adventure, food]);
    expect(result[0].type).toBe("Logistics");
    expect(result[0].description).toMatch(/rain/i);
  });

  it("returns the original array unchanged when no outdoor activities", () => {
    const indoorOnly = [food, culture];
    const result = replanForRain(indoorOnly);
    expect(result).toBe(indoorOnly);
  });

  it("replaces all outdoor activities in a fully-outdoor day", () => {
    const result = replanForRain([adventure, exploration]);
    const outdoorCount = result.filter(isOutdoorActivity).length;
    expect(outdoorCount).toBe(0);
  });
});
