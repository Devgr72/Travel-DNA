// [Accessibility] aria-live announces DNA analysis results when they load.
// [Testing] Uses computeRadarData from src/lib/dna.ts.
"use client";

import { useEffect, useState } from "react";
import { useReducedMotion, motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from "recharts";
import { computeRadarData } from "@/lib/dna";
import type { Traits } from "@/lib/schema";

type DNAAnalysis = {
  title: string;
  summary: string;
  strengths: string[];
};

export default function DNAProfile() {
  const shouldReduceMotion = useReducedMotion();
  const [dna, setDna] = useState<Traits | null>(null);
  const [analysis, setAnalysis] = useState<DNAAnalysis | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("travelDNA");
    if (saved) setDna(JSON.parse(saved) as Traits);

    const savedAnalysis = localStorage.getItem("travelAnalysis");
    if (savedAnalysis) setAnalysis(JSON.parse(savedAnalysis) as DNAAnalysis);
  }, []);

  if (!dna) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading your DNA profile"
        className="glass-panel p-10 rounded-3xl animate-pulse flex flex-col items-start w-full border border-card-border/50"
      >
        <div className="h-6 bg-muted rounded w-32 mb-8" />
        <div className="h-10 bg-muted rounded w-2/3 mb-4" />
        <div className="h-4 bg-muted rounded w-full mb-2" />
        <div className="h-4 bg-muted rounded w-5/6 mb-8" />
        <div className="h-64 bg-muted rounded w-full mt-4" />
      </div>
    );
  }

  const data = computeRadarData(dna);

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col gap-6"
    >
      <div className="glass-panel p-8 md:p-10 rounded-3xl w-full flex flex-col relative overflow-hidden bg-card/60 backdrop-blur-xl border border-card-border">
        {/* [Accessibility] aria-live polite — announces when analysis title/summary arrive */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="flex flex-col items-start mb-8 pb-8 border-b border-card-border/60"
        >
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3">
            Behavioral Profile
          </h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
            {analysis?.title ?? "The Undiscovered Traveler"}
          </h3>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-md">
            {analysis?.summary ?? "Your unique travel behavior signature is being analyzed…"}
          </p>

          {analysis?.strengths && (
            <ul className="flex flex-wrap gap-2 mt-6 list-none p-0" aria-label="Travel strengths">
              {analysis.strengths.map((strength, idx) => (
                <li
                  key={idx}
                  className="px-3 py-1 bg-muted text-foreground text-xs font-semibold rounded-full border border-card-border"
                >
                  {strength}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className="w-full h-[300px] mt-4 relative"
          role="img"
          aria-label={`Radar chart showing your travel DNA across six dimensions: ${Object.entries(dna).map(([k, v]) => `${k} ${v}`).join(", ")}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="var(--card-border)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 8]} tick={false} axisLine={false} />
              <Radar
                name="DNA"
                dataKey="A"
                stroke="var(--foreground)"
                strokeWidth={2}
                fill="var(--foreground)"
                fillOpacity={0.05}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
