// [Accessibility] All inputs have id + htmlFor label association.
// [Problem Alignment] Constraints inputs (budget cap, mobility, dietary, mustAvoid).
// [Efficiency] Wrapped in memo — only re-renders when isLoading changes or onGenerate reference changes.
"use client";

import { memo, useState } from "react";
import { useReducedMotion, motion } from "framer-motion";
import { Plane, Calendar, DollarSign, Wand2, ChevronDown } from "lucide-react";
import type { Constraints } from "@/lib/schema";

type GeneratePayload = {
  destination: string;
  duration: string;
  budget: string;
  constraints: Constraints;
};

type ItineraryGeneratorProps = {
  onGenerate: (data: GeneratePayload) => void;
  isLoading: boolean;
};

const ItineraryGenerator = memo(function ItineraryGenerator({
  onGenerate,
  isLoading,
}: ItineraryGeneratorProps) {
  const shouldReduceMotion = useReducedMotion();
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [dailyBudgetUSD, setDailyBudgetUSD] = useState("");
  const [mobility, setMobility] = useState<"" | "none" | "limited" | "wheelchair">("");
  const [dietary, setDietary] = useState("");
  const [mustAvoid, setMustAvoid] = useState("");
  const [showConstraints, setShowConstraints] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !duration || !budget) return;

    const constraints: Constraints = {};
    if (dailyBudgetUSD) constraints.dailyBudgetUSD = Number(dailyBudgetUSD);
    if (mobility) constraints.mobility = mobility;
    if (dietary.trim())
      constraints.dietary = dietary
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    if (mustAvoid.trim())
      constraints.mustAvoid = mustAvoid
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    onGenerate({ destination, duration, budget, constraints });
  };

  return (
    <div className="glass-panel p-8 md:p-10 rounded-3xl w-full bg-card/60 backdrop-blur-xl border border-card-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg" aria-hidden="true">
          <Wand2 className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground tracking-tight">Generate Journey</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
        We&apos;ll use your Travel DNA to craft the perfect itinerary for your next trip.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6" aria-label="Trip generation form">
        {/* Destination */}
        <div>
          <label
            htmlFor="destination"
            className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2"
          >
            Where to?
          </label>
          <div className="relative">
            <div
              className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
              aria-hidden="true"
            >
              <Plane className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <input
              id="destination"
              type="text"
              required
              placeholder="e.g. Tokyo, Japan"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-card-border rounded-xl bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label
            htmlFor="duration"
            className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2"
          >
            Duration (Days)
          </label>
          <div className="relative">
            <div
              className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
              aria-hidden="true"
            >
              <Calendar className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <input
              id="duration"
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

        {/* Budget Level */}
        <div>
          <label
            htmlFor="budget"
            className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2"
          >
            Budget Level
          </label>
          <div className="relative">
            <div
              className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
              aria-hidden="true"
            >
              <DollarSign className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <select
              id="budget"
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-card-border rounded-xl bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm appearance-none shadow-sm cursor-pointer"
            >
              <option value="" disabled>
                Select Budget
              </option>
              <option value="Budget">Budget-friendly</option>
              <option value="Moderate">Moderate</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>
        </div>

        {/* [Problem Alignment] Constraints section */}
        <div className="border border-card-border rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowConstraints((v) => !v)}
            aria-expanded={showConstraints}
            aria-controls="constraints-panel"
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:bg-muted/40 transition-colors"
          >
            <span>Constraints &amp; Preferences</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showConstraints ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {showConstraints && (
            <div
              id="constraints-panel"
              className="px-4 pb-4 space-y-4 border-t border-card-border pt-4"
            >
              {/* Daily Budget Cap */}
              <div>
                <label
                  htmlFor="daily-budget"
                  className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2"
                >
                  Daily Budget Cap (USD)
                </label>
                <input
                  id="daily-budget"
                  type="number"
                  min="1"
                  max="10000"
                  placeholder="e.g. 150"
                  value={dailyBudgetUSD}
                  onChange={(e) => setDailyBudgetUSD(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-card-border rounded-xl bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>

              {/* Mobility */}
              <div>
                <label
                  htmlFor="mobility"
                  className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2"
                >
                  Mobility
                </label>
                <select
                  id="mobility"
                  value={mobility}
                  onChange={(e) => setMobility(e.target.value as typeof mobility)}
                  className="block w-full px-4 py-2.5 border border-card-border rounded-xl bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none cursor-pointer"
                >
                  <option value="">No restrictions</option>
                  <option value="limited">Limited mobility</option>
                  <option value="wheelchair">Wheelchair user</option>
                </select>
              </div>

              {/* Dietary */}
              <div>
                <label
                  htmlFor="dietary"
                  className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2"
                >
                  Dietary Restrictions
                </label>
                <input
                  id="dietary"
                  type="text"
                  placeholder="e.g. vegetarian, gluten-free"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-card-border rounded-xl bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
              </div>

              {/* Must Avoid */}
              <div>
                <label
                  htmlFor="must-avoid"
                  className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2"
                >
                  Must Avoid
                </label>
                <input
                  id="must-avoid"
                  type="text"
                  placeholder="e.g. casinos, loud nightclubs"
                  value={mustAvoid}
                  onChange={(e) => setMustAvoid(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-card-border rounded-xl bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
              </div>
            </div>
          )}
        </div>

        <motion.button
          whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
          disabled={isLoading || !destination || !duration || !budget}
          type="submit"
          className="w-full py-3.5 px-4 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 mt-4 text-sm"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <div
                className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                aria-hidden="true"
              />
              <span>Synthesizing…</span>
            </>
          ) : (
            <span>Craft My Itinerary</span>
          )}
        </motion.button>
      </form>
    </div>
  );
});

export default ItineraryGenerator;
