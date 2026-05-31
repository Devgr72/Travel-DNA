// [Problem Alignment] Shows satisfies badges, estimated costs, and constraint warnings per activity.
// [Accessibility] Semantic <ol> timeline; aria-label on each activity card.
"use client";

import { useReducedMotion, motion } from "framer-motion";
import {
  MapPin,
  Utensils,
  Moon,
  Navigation,
  Landmark,
  Sun,
  Heart,
  Tent,
  AlertTriangle,
} from "lucide-react";
import type { Activity, ItineraryData } from "@/lib/schema";

export type { ItineraryData };

const TYPE_ICON_MAP: Partial<Record<string, React.ComponentType<{ className?: string }>>> = {
  food: Utensils,
  culture: Landmark,
  adventure: Tent,
  luxury: Heart,
  social: Moon,
  exploration: MapPin,
  logistics: Navigation,
};

function ActivityIcon({ type }: { type: string }) {
  const Icon = TYPE_ICON_MAP[type.toLowerCase()] ?? Sun;
  return (
    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <article aria-label={`${activity.time} — ${activity.type}: ${activity.description}`}>
      <div className="flex gap-4 md:gap-5">
        <div
          aria-hidden="true"
          className="flex-shrink-0 w-10 h-10 rounded-full bg-muted border border-card-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all shadow-sm z-10"
        >
          <ActivityIcon type={activity.type} />
        </div>

        <div className="flex-1 bg-card border border-card-border p-5 rounded-2xl group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2.5 gap-2">
            <span className="text-xs font-bold text-foreground tracking-wider uppercase">
              {activity.time}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 bg-muted rounded-md text-muted-foreground inline-block w-fit">
                {activity.type}
              </span>
              {/* [Problem Alignment] Estimated cost — always labelled as estimate */}
              {activity.estimatedCostUSD != null && (
                <span
                  title="Estimated cost — actual prices may vary"
                  className="text-[10px] font-semibold px-2.5 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded-md"
                >
                  ~${activity.estimatedCostUSD} est.
                </span>
              )}
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed text-sm">{activity.description}</p>

          {/* [Problem Alignment] satisfies list — which preference/constraint this meets */}
          {activity.satisfies && activity.satisfies.length > 0 && (
            <ul
              aria-label="Preferences satisfied by this activity"
              className="flex flex-wrap gap-1.5 mt-3 list-none p-0"
            >
              {activity.satisfies.map((tag, i) => (
                <li
                  key={i}
                  className="text-[10px] px-2 py-0.5 bg-primary/8 text-primary rounded-full border border-primary/20 font-medium"
                >
                  ✓ {tag}
                </li>
              ))}
            </ul>
          )}

          {/* [Problem Alignment] Constraint warning — surfaces unmet constraints honestly */}
          {activity.constraintWarning && (
            <div
              role="alert"
              className="flex items-start gap-2 mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg"
            >
              <AlertTriangle
                className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                {activity.constraintWarning}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ItineraryTimeline({ data }: { data: ItineraryData }) {
  const shouldReduceMotion = useReducedMotion();

  if (!data?.days?.length) {
    return <p className="text-muted-foreground italic">No itinerary data available.</p>;
  }

  return (
    <ol
      aria-label="Trip itinerary"
      className="relative border-l border-card-border ml-4 md:ml-8 pb-12 list-none p-0"
    >
      {data.days.map((day, dayIdx) => (
        <li key={dayIdx} className="mb-14 relative">
          {/* Day Marker */}
          <div
            aria-hidden="true"
            className="absolute -left-[25px] md:-left-[29px] top-0 bg-background w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center border border-card-border shadow-sm z-10"
          >
            <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Day
            </span>
            <span className="text-base md:text-lg font-extrabold text-foreground leading-none">
              {day.day}
            </span>
          </div>

          <div className="pl-10 md:pl-12 pt-1">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-8 tracking-tight">
              {day.title}
            </h3>

            <ol className="space-y-6 list-none p-0">
              {day.activities.map((activity, actIdx) => (
                <motion.li
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ delay: dayIdx * 0.1 + actIdx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  key={actIdx}
                  className="relative group"
                >
                  {actIdx !== day.activities.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="absolute left-5 top-12 bottom-[-24px] w-[1px] bg-card-border"
                    />
                  )}
                  <ActivityCard activity={activity} />
                </motion.li>
              ))}
            </ol>
          </div>
        </li>
      ))}
    </ol>
  );
}
