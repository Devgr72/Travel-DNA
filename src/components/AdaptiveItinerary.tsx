// [Accessibility] aria-live polite announces each adaptive re-plan to screen readers.
// [Efficiency] Only the itinerary portion is sent for re-planning; wowFactor is preserved.
"use client";

import { useState } from "react";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import {
  CloudRain,
  Sun,
  CloudLightning,
  Snowflake,
  Send,
  RefreshCw,
  Sparkles,
  AlertOctagon,
} from "lucide-react";
import ItineraryTimeline, { type ItineraryData } from "./ItineraryTimeline";

export type TripData = {
  personalityAnalysis: {
    title: string;
    summary: string;
    strengths: string[];
  };
  wowFactor: {
    hiddenGems: { name: string; description: string }[];
    touristTrapsToAvoid: { name: string; reason: string }[];
  };
  itinerary: ItineraryData;
};

type AdaptiveItineraryProps = {
  initialTripData: TripData;
};

const weatherSimulations = [
  {
    label: "Sunny & Hot",
    icon: Sun,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    context: "A sudden heatwave hit. We need shade, AC, and lots of water-based activities.",
  },
  {
    label: "Heavy Rain",
    icon: CloudRain,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    context: "It started raining heavily. Move all activities indoors immediately.",
  },
  {
    label: "Thunderstorm",
    icon: CloudLightning,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    context: "Severe thunderstorm warning. Need to stay at the hotel or very close by.",
  },
  {
    label: "Snow",
    icon: Snowflake,
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    context: "Unexpected snowfall! Optimize for cozy cafes, fireplaces, and beautiful snowy walks.",
  },
];

export default function AdaptiveItinerary({ initialTripData }: AdaptiveItineraryProps) {
  const shouldReduceMotion = useReducedMotion();
  const [tripData, setTripData] = useState<TripData>(initialTripData);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptationInput, setAdaptationInput] = useState("");
  // [Accessibility] Status message announced via aria-live after each re-plan
  const [statusMessage, setStatusMessage] = useState("");

  const handleAdapt = async (context: string) => {
    if (!context) return;
    setIsAdapting(true);
    setStatusMessage("Recalibrating your itinerary…");
    try {
      const response = await fetch("/api/adapt-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentItineraryData: tripData.itinerary, context }),
      });

      if (!response.ok) throw new Error("Failed to adapt");
      const result = (await response.json()) as { updatedItineraryData: ItineraryData };

      setTripData((prev) => ({ ...prev, itinerary: result.updatedItineraryData }));
      setAdaptationInput("");
      setStatusMessage(`Itinerary updated for: ${context}`);
    } catch (error) {
      console.error(error);
      setStatusMessage("Adaptation failed. Please check your API key and try again.");
    } finally {
      setIsAdapting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* [Accessibility] aria-live polite — announces re-plan status */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      {/* Hidden Gems & Tourist Traps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section
          aria-labelledby="hidden-gems-heading"
          className="glass-panel p-6 rounded-2xl border border-card-border bg-card/60 backdrop-blur-xl flex flex-col h-full"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <h3 id="hidden-gems-heading" className="font-semibold text-foreground tracking-tight">
              Curated Hidden Gems
            </h3>
          </div>
          <ul className="space-y-4 flex-1 list-none p-0">
            {tripData.wowFactor?.hiddenGems?.map((gem) => (
              <li key={gem.name} className="border-l-2 border-amber-500/30 pl-3">
                <h4 className="text-sm font-bold text-foreground">{gem.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {gem.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="traps-heading"
          className="glass-panel p-6 rounded-2xl border border-card-border bg-card/60 backdrop-blur-xl flex flex-col h-full"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertOctagon className="w-5 h-5 text-red-500" aria-hidden="true" />
            <h3 id="traps-heading" className="font-semibold text-foreground tracking-tight">
              Tourist Traps To Avoid
            </h3>
          </div>
          <ul className="space-y-4 flex-1 list-none p-0">
            {tripData.wowFactor?.touristTrapsToAvoid?.map((trap) => (
              <li key={trap.name} className="border-l-2 border-red-500/30 pl-3">
                <h4 className="text-sm font-bold text-foreground">{trap.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{trap.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Adaptive Intelligence Engine */}
      <section
        aria-labelledby="adapt-heading"
        className="glass-panel p-6 rounded-3xl w-full sticky top-4 z-20 shadow-sm border border-card-border bg-card/90 backdrop-blur-xl"
      >
        <h3
          id="adapt-heading"
          className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4 flex items-center gap-2"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isAdapting ? "animate-spin text-primary" : ""}`}
            aria-hidden="true"
          />
          Adaptive Intelligence Engine
        </h3>

        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"
          role="group"
          aria-label="Simulate weather change"
        >
          {weatherSimulations.map((sim) => (
            <button
              key={sim.label}
              onClick={() => handleAdapt(sim.context)}
              disabled={isAdapting}
              aria-label={`Simulate ${sim.label}: ${sim.context}`}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-muted/50 hover:bg-muted border border-card-border rounded-xl transition-all disabled:opacity-50 group cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div
                className={`p-2 rounded-lg ${sim.bg} group-hover:scale-105 transition-transform`}
                aria-hidden="true"
              >
                <sim.icon className={`w-5 h-5 ${sim.color}`} />
              </div>
              <span className="text-xs font-semibold text-foreground">{sim.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <label htmlFor="adaptation-input" className="sr-only">
            Describe a real-time change or preference to re-plan around
          </label>
          <input
            id="adaptation-input"
            type="text"
            value={adaptationInput}
            onChange={(e) => setAdaptationInput(e.target.value)}
            placeholder="E.g. 'I feel tired today', 'I found a bike rental'"
            className="flex-1 px-4 py-2.5 bg-background border border-card-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter" && adaptationInput) handleAdapt(adaptationInput);
            }}
            aria-label="Describe a real-time change or preference"
          />
          <button
            onClick={() => handleAdapt(adaptationInput)}
            disabled={isAdapting || !adaptationInput}
            aria-label="Apply adaptation"
            className="px-6 bg-primary hover:opacity-90 text-primary-foreground rounded-xl disabled:opacity-50 transition-all font-semibold flex items-center gap-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span className="hidden md:inline">Adapt</span>
          </button>
        </div>
      </section>

      {/* Itinerary Display */}
      <div className="relative mt-4">
        <AnimatePresence>
          {isAdapting && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1 }}
              exit={shouldReduceMotion ? {} : { opacity: 0 }}
              className="absolute inset-0 bg-background/50 backdrop-blur-md flex items-center justify-center rounded-3xl z-30"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex flex-col items-center gap-4 bg-card p-8 rounded-2xl border border-card-border shadow-xl">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
                <span className="text-foreground font-bold text-lg tracking-tight">
                  Recalibrating Timeline…
                </span>
                <p className="text-muted-foreground text-sm">
                  Injecting new variables into the DNA model
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass-panel p-8 md:p-10 rounded-3xl w-full bg-card/40 border border-card-border shadow-sm">
          <ItineraryTimeline data={tripData.itinerary} />
        </div>
      </div>
    </div>
  );
}
