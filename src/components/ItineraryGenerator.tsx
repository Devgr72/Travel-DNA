"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, Calendar, DollarSign, Wand2 } from "lucide-react";

type ItineraryGeneratorProps = {
  onGenerate: (data: { destination: string; duration: string; budget: string }) => void;
  isLoading: boolean;
};

export default function ItineraryGenerator({ onGenerate, isLoading }: ItineraryGeneratorProps) {
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !duration || !budget) return;
    onGenerate({ destination, duration, budget });
  };

  return (
    <div className="glass-panel p-8 md:p-10 rounded-3xl w-full bg-card/60 backdrop-blur-xl border border-card-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Wand2 className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground tracking-tight">Generate Journey</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
        We&apos;ll use your Travel DNA to craft the perfect itinerary for your next trip.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Where to?</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Plane className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Tokyo, Japan"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-card-border rounded-xl bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Duration (Days)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <input
              type="number"
              min="1"
              max="30"
              required
              placeholder="e.g. 5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-card-border rounded-xl bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Budget Level</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <DollarSign className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <select
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-card-border rounded-xl bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm appearance-none shadow-sm cursor-pointer"
            >
              <option value="" disabled>Select Budget</option>
              <option value="Budget">Budget-friendly</option>
              <option value="Moderate">Moderate</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={isLoading || !destination || !duration || !budget}
          type="submit"
          className="w-full py-3.5 px-4 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 mt-4 text-sm"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <span>Craft My Itinerary</span>
          )}
        </motion.button>
      </form>
    </div>
  );
}
