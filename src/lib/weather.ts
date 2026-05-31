/** Pure functions for weather-driven re-planning (outdoor → indoor swap). */
import type { Activity } from "./schema";

/** Activity types that are primarily outdoors. */
const OUTDOOR_TYPES = new Set(["adventure", "exploration"]);

/** Human-readable indoor substitute description by outdoor activity type. */
const INDOOR_ALTERNATIVES: Record<string, string> = {
  adventure: "indoor climbing wall or escape room",
  exploration: "covered market or museum gallery",
};

/** Safe indoor activity type to replace each outdoor type. */
const OUTDOOR_TO_INDOOR_TYPE: Record<string, Activity["type"]> = {
  adventure: "Culture",
  exploration: "Culture",
};

/**
 * Returns `true` when the activity is primarily outdoors and weather-sensitive.
 * @param activity - Activity to classify.
 */
export function isOutdoorActivity(activity: Activity): boolean {
  return OUTDOOR_TYPES.has(activity.type.toLowerCase());
}

/**
 * Suggests a human-readable indoor substitute for an outdoor activity type.
 * @param outdoorType - Activity type string (case-insensitive).
 * @returns Indoor alternative description, or a generic fallback.
 */
export function indoorAlternativeFor(outdoorType: string): string {
  return INDOOR_ALTERNATIVES[outdoorType.toLowerCase()] ?? "indoor alternative";
}

/**
 * Maps outdoor activities to indoor equivalents without mutating the input.
 * Only affected activities are rewritten; all others are returned by reference.
 * @param activities     - Activity list to process.
 * @param weatherContext - Human-readable weather description appended to descriptions.
 * @returns New array with outdoor activities replaced.
 */
export function swapOutdoorToIndoor(activities: Activity[], weatherContext: string): Activity[] {
  return activities.map((a) => {
    if (!isOutdoorActivity(a)) return a;
    return {
      ...a,
      description: `${a.description} [Moved indoors due to weather: ${weatherContext}. Alternative: ${indoorAlternativeFor(a.type)}]`,
      type: OUTDOOR_TO_INDOOR_TYPE[a.type.toLowerCase()] ?? "Culture",
    };
  });
}

/**
 * Counts the number of outdoor activities in a list.
 * @param activities - Activity list to scan.
 * @returns Number of outdoor activities.
 */
export function countOutdoorActivities(activities: Activity[]): number {
  return activities.filter(isOutdoorActivity).length;
}

/**
 * Applies a rain re-plan: swaps outdoor activities to indoor equivalents and
 * prepends a Logistics note. Returns the original array unchanged when there
 * are no outdoor activities (no-op path).
 * @param activities - Activity list for the affected day.
 * @returns New array if any swaps occurred; original array reference otherwise.
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
