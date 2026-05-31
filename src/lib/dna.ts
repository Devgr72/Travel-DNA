// [Testing] Pure functions for DNA vector scoring — no I/O, no React.
import type { Traits } from "./schema";

export type TraitKey = keyof Traits;

/** Clamps each trait to [min, max]. Default range matches quiz max score. */
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

/** Builds the recharts-compatible radar data array. */
export function computeRadarData(
  traits: Traits,
): { subject: string; A: number; fullMark: number }[] {
  return (Object.entries(traits) as [TraitKey, number][]).map(([subject, A]) => ({
    subject,
    A,
    fullMark: 20,
  }));
}

/** Returns the trait with the highest score; ties broken alphabetically. */
export function getDominantTrait(traits: Traits): TraitKey {
  return (Object.entries(traits) as [TraitKey, number][]).reduce((best, cur) =>
    cur[1] > best[1] ? cur : best,
  )[0];
}

/** Returns 0-1 alignment score between an activity type string and user traits. */
export function scoreTraitAlignment(traits: Traits, activityType: string): number {
  const map: Partial<Record<string, TraitKey>> = {
    food: "Food",
    culture: "Culture",
    adventure: "Adventure",
    luxury: "Luxury",
    social: "Social",
    exploration: "Exploration",
    relaxation: "Luxury",
    logistics: "Exploration",
  };
  const key = map[activityType.toLowerCase()];
  if (!key) return 0.5;
  const maxPossible = 20;
  return Math.min(1, Math.max(0, traits[key] / maxPossible));
}

/** Sorts traits by score descending and returns the top N keys. */
export function getTopTraits(traits: Traits, n: number): TraitKey[] {
  return (Object.entries(traits) as [TraitKey, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}
