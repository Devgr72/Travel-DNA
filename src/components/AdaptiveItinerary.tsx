"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudRain, Sun, CloudLightning, Snowflake, Send, RefreshCw, Sparkles, AlertOctagon } from "lucide-react";
import ItineraryTimeline, { ItineraryData } from "./ItineraryTimeline";

// Define the full trip data type expected from the API
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

export default function AdaptiveItinerary({ initialTripData }: AdaptiveItineraryProps) {
  const [tripData, setTripData] = useState<TripData>(initialTripData);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptationInput, setAdaptationInput] = useState("");

  const weatherSimulations = [
    { label: "Sunny & Hot", icon: Sun, color: "text-amber-500", bg: "bg-amber-500/10", context: "A sudden heatwave hit. We need shade, AC, and lots of water-based activities." },
    { label: "Heavy Rain", icon: CloudRain, color: "text-blue-500", bg: "bg-blue-500/10", context: "It started raining heavily. Move all activities indoors immediately." },
    { label: "Thunderstorm", icon: CloudLightning, color: "text-purple-500", bg: "bg-purple-500/10", context: "Severe thunderstorm warning. Need to stay at the hotel or very close by." },
    { label: "Snow", icon: Snowflake, color: "text-slate-500", bg: "bg-slate-500/10", context: "Unexpected snowfall! Optimize for cozy cafes, fireplaces, and beautiful snowy walks." },
  ];

  const handleAdapt = async (context: string) => {
    if (!context) return;
    setIsAdapting(true);
    try {
      const response = await fetch("/api/adapt-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We only pass the itinerary part to adapt, so we don't regenerate gems unless we want to
        body: JSON.stringify({ currentItineraryData: tripData.itinerary, context }),
      });

      if (!response.ok) throw new Error("Failed to adapt");
      const result = await response.json();
      
      setTripData(prev => ({
        ...prev,
        itinerary: result.updatedItineraryData
      }));
      setAdaptationInput("");
    } catch (error) {
      console.error(error);
      alert("Error adapting itinerary. Please check your API key.");
    } finally {
      setIsAdapting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Wow Factor: Hidden Gems & Traps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-card-border bg-card/60 backdrop-blur-xl flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-foreground tracking-tight">Curated Hidden Gems</h3>
          </div>
          <div className="space-y-4 flex-1">
            {tripData.wowFactor?.hiddenGems?.map((gem, idx) => (
              <div key={idx} className="border-l-2 border-amber-500/30 pl-3">
                <h4 className="text-sm font-bold text-foreground">{gem.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{gem.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-card-border bg-card/60 backdrop-blur-xl flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <AlertOctagon className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-foreground tracking-tight">Tourist Traps To Avoid</h3>
          </div>
          <div className="space-y-4 flex-1">
            {tripData.wowFactor?.touristTrapsToAvoid?.map((trap, idx) => (
              <div key={idx} className="border-l-2 border-red-500/30 pl-3">
                <h4 className="text-sm font-bold text-foreground">{trap.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{trap.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weather Simulator */}
      <div className="glass-panel p-6 rounded-3xl w-full sticky top-4 z-20 shadow-sm border border-card-border bg-card/90 backdrop-blur-xl">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4 flex items-center gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${isAdapting ? 'animate-spin text-primary' : ''}`} />
          Adaptive Intelligence Engine
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {weatherSimulations.map((sim, idx) => (
            <button
              key={idx}
              onClick={() => handleAdapt(sim.context)}
              disabled={isAdapting}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-muted/50 hover:bg-muted border border-card-border rounded-xl transition-all disabled:opacity-50 group cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${sim.bg} group-hover:scale-105 transition-transform`}>
                <sim.icon className={`w-5 h-5 ${sim.color}`} />
              </div>
              <span className="text-xs font-semibold text-foreground">{sim.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={adaptationInput}
            onChange={(e) => setAdaptationInput(e.target.value)}
            placeholder="E.g., 'I feel tired today', 'I found a bike rental'"
            className="flex-1 px-4 py-2.5 bg-background border border-card-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdapt(adaptationInput);
            }}
          />
          <button
            onClick={() => handleAdapt(adaptationInput)}
            disabled={isAdapting || !adaptationInput}
            className="px-6 bg-primary hover:opacity-90 text-primary-foreground rounded-xl disabled:opacity-50 transition-all font-semibold flex items-center gap-2 text-sm shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden md:inline">Adapt</span>
          </button>
        </div>
      </div>

      {/* Itinerary Display */}
      <div className="relative mt-4">
        <AnimatePresence>
          {isAdapting && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/50 backdrop-blur-md flex items-center justify-center rounded-3xl z-30"
            >
              <div className="flex flex-col items-center gap-4 bg-card p-8 rounded-2xl border border-card-border shadow-xl">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                <span className="text-foreground font-bold text-lg tracking-tight">Recalibrating Timeline...</span>
                <p className="text-muted-foreground text-sm">Injecting new variables into the DNA model</p>
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
