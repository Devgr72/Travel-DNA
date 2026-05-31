// [Testing] Pure functions for weather re-planning (outdoor → indoor swap).
import type { Activity } from "./schema";

const OUTDOOR_TYPES = new Set(["adventure", "exploration"]);

const INDOOR_ALTERNATIVES: Record<string, string> = {
  adventure: "indoor climbing wall or escape room",
  exploration: "covered market or museum gallery",
};

// Maps outdoor activity types to safe indoor replacements
const OUTDOOR_TO_INDOOR_TYPE: Record<string, Activity["type"]> = {
  adventure: "Culture",
  exploration: "Culture",
};

/** Returns true when the activity is primarily outdoors. */
export function isOutdoorActivity(activity: Activity): boolean {
  return OUTDOOR_TYPES.has(activity.type.toLowerCase());
}

/** Suggests an indoor substitute description for an outdoor activity type. */
export function indoorAlternativeFor(outdoorType: string): string {
  return INDOOR_ALTERNATIVES[outdoorType.toLowerCase()] ?? "indoor alternative";
}

/**
 * Swaps outdoor activities to indoor equivalents.
 * Does not regenerate the whole day; only affected items are touched.
 */
export function swapOutdoorToIndoor(
  activities: Activity[],
  weatherContext: string
): Activity[] {
  return activities.map((a) => {
    if (!isOutdoorActivity(a)) return a;
    return {
      ...a,
      description: `${a.description} [Moved indoors due to weather: ${weatherContext}. Alternative: ${indoorAlternativeFor(a.type)}]`,
      type: OUTDOOR_TO_INDOOR_TYPE[a.type.toLowerCase()] ?? "Culture",
    };
  });
}

/** Counts outdoor activities in a list. */
export function countOutdoorActivities(activities: Activity[]): number {
  return activities.filter(isOutdoorActivity).length;
}

/**
 * Applies a rain re-plan: swaps outdoor activities and prepends a note.
 * Returns a new array; input is not mutated.
 */
export function replanForRain(activities: Activity[]): Activity[] {
  const note: Activity = {
    time: "Note",
    description: "Rain detected — outdoor activities rescheduled to indoor venues.",
    type: "Logistics",
  };
  const swapped = swapOutdoorToIndoor(activities, "rain");
  const changed = swapped.some((a, i) => a !== activities[i]);
  return changed ? [note, ...swapped] : activities;
}
