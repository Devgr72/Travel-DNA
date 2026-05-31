import { describe, it, expect } from "vitest";
import {
  normalizeDnaScores,
  computeRadarData,
  getDominantTrait,
  scoreTraitAlignment,
  getTopTraits,
} from "../dna";
import type { Traits } from "../schema";

const baseTrait: Traits = {
  Adventure: 8,
  Food: 5,
  Culture: 10,
  Luxury: 2,
  Social: 3,
  Exploration: 7,
};

describe("normalizeDnaScores", () => {
  it("returns values unchanged when already in range", () => {
    const result = normalizeDnaScores(baseTrait);
    expect(result.Adventure).toBe(8);
    expect(result.Culture).toBe(10);
  });

  it("clamps values above the max", () => {
    const result = normalizeDnaScores({ ...baseTrait, Adventure: 999 });
    expect(result.Adventure).toBe(20);
  });

  it("clamps values below the min", () => {
    const result = normalizeDnaScores({ ...baseTrait, Social: -100 });
    expect(result.Social).toBe(-10);
  });

  it("handles all-zero traits without throwing", () => {
    const zero: Traits = { Adventure: 0, Food: 0, Culture: 0, Luxury: 0, Social: 0, Exploration: 0 };
    const result = normalizeDnaScores(zero);
    expect(Object.values(result).every((v) => v === 0)).toBe(true);
  });
});

describe("computeRadarData", () => {
  it("returns one entry per trait key", () => {
    const data = computeRadarData(baseTrait);
    expect(data).toHaveLength(6);
  });

  it("each entry has subject, A, and fullMark", () => {
    const data = computeRadarData(baseTrait);
    data.forEach((d) => {
      expect(d).toHaveProperty("subject");
      expect(d).toHaveProperty("A");
      expect(d.fullMark).toBe(20);
    });
  });

  it("preserves the correct A values", () => {
    const data = computeRadarData(baseTrait);
    const culture = data.find((d) => d.subject === "Culture");
    expect(culture?.A).toBe(10);
  });
});

describe("getDominantTrait", () => {
  it("returns the highest-scoring trait", () => {
    expect(getDominantTrait(baseTrait)).toBe("Culture");
  });

  it("returns a valid trait key even when all scores are equal", () => {
    const flat: Traits = { Adventure: 5, Food: 5, Culture: 5, Luxury: 5, Social: 5, Exploration: 5 };
    const result = getDominantTrait(flat);
    expect(Object.keys(flat)).toContain(result);
  });

  it("handles negative scores correctly", () => {
    const neg: Traits = { Adventure: -5, Food: -3, Culture: -1, Luxury: -8, Social: -2, Exploration: -4 };
    expect(getDominantTrait(neg)).toBe("Culture");
  });
});

describe("scoreTraitAlignment", () => {
  it("returns a score between 0 and 1", () => {
    const score = scoreTraitAlignment(baseTrait, "Culture");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("returns 0.5 for unknown activity types", () => {
    expect(scoreTraitAlignment(baseTrait, "unknownType")).toBe(0.5);
  });

  it("returns a higher score for high trait values", () => {
    const highCulture: Traits = { ...baseTrait, Culture: 20 };
    const lowCulture: Traits = { ...baseTrait, Culture: 0 };
    expect(scoreTraitAlignment(highCulture, "culture")).toBeGreaterThan(
      scoreTraitAlignment(lowCulture, "culture")
    );
  });

  it("is case-insensitive for activity type", () => {
    expect(scoreTraitAlignment(baseTrait, "FOOD")).toBe(scoreTraitAlignment(baseTrait, "food"));
  });
});

describe("getTopTraits", () => {
  it("returns the correct number of traits", () => {
    expect(getTopTraits(baseTrait, 3)).toHaveLength(3);
  });

  it("returns traits in descending score order", () => {
    const top = getTopTraits(baseTrait, 2);
    expect(top[0]).toBe("Culture"); // 10
    expect(top[1]).toBe("Adventure"); // 8
  });

  it("returns all traits when n >= trait count", () => {
    expect(getTopTraits(baseTrait, 10)).toHaveLength(6);
  });
});
