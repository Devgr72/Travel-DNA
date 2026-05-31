/** Pure functions for DNA vector scoring — no I/O, no React. */
import type { Traits } from "./schema";

export type TraitKey = keyof Traits;

/** Maps lower-case activity type strings to their corresponding trait key. */
const ACTIVITY_TRAIT_MAP: Partial<Record<string, TraitKey>> = {
  food: "Food",
  culture: "Culture",
  adventure: "Adventure",
  luxury: "Luxury",
  social: "Social",
  exploration: "Exploration",
  relaxation: "Luxury",
  logistics: "Exploration",
};

/**
 * Clamps each trait score to [min, max].
 * @param raw - Raw trait object from the quiz accumulator.
 * @param min - Lower bound (default −10, matching quiz minimum).
 * @param max - Upper bound (default 20, matching quiz maximum).
 * @returns New Traits object with every value clamped.
 */
export function normalizeDnaScores(raw: Traits, min = -10, max = 20): Traits {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return {
    Adventure: clamp(raw.Adventure),
    Food: clamp(raw.Food),
    Culture: clamp(raw.Culture),
    Luxury: clamp(raw.Luxury),
    Social: clamp(raw.Social),
    Exploration: clamp(raw.Exploration),
  };
}

/**
 * Builds the Recharts-compatible radar data array from a Traits object.
 * @param traits - Normalised trait scores.
 * @returns Array of `{ subject, A, fullMark }` entries, one per trait.
 */
export function computeRadarData(
  traits: Traits,
): { subject: string; A: number; fullMark: number }[] {
  return (Object.entries(traits) as [TraitKey, number][]).map(([subject, A]) => ({
    subject,
    A,
    fullMark: 20,
  }));
}

/**
 * Returns the key of the highest-scoring trait; ties broken by first-in-order.
 * @param traits - Trait scores to evaluate.
 * @returns The dominant `TraitKey`.
 */
export function getDominantTrait(traits: Traits): TraitKey {
  return (Object.entries(traits) as [TraitKey, number][]).reduce((best, cur) =>
    cur[1] > best[1] ? cur : best,
  )[0];
}

/**
 * Returns a 0–1 alignment score between a trait vector and an activity type.
 * Unknown activity types return a neutral 0.5 to avoid false negatives.
 * @param traits       - User's DNA trait scores.
 * @param activityType - Activity type string (case-insensitive).
 * @returns Alignment score in [0, 1].
 */
export function scoreTraitAlignment(traits: Traits, activityType: string): number {
  const key = ACTIVITY_TRAIT_MAP[activityType.toLowerCase()];
  if (!key) return 0.5;
  const maxPossible = 20;
  return Math.min(1, Math.max(0, traits[key] / maxPossible));
}

/**
 * Sorts traits by score descending and returns the top N trait keys.
 * @param traits - Trait scores to rank.
 * @param n      - Number of top traits to return.
 * @returns Array of up to `n` `TraitKey` values, highest-scoring first.
 */
export function getTopTraits(traits: Traits, n: number): TraitKey[] {
  return (Object.entries(traits) as [TraitKey, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}
