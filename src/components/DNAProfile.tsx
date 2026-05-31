"use client";

import { useEffect, useState } from "react";
import { Traits } from "./Quiz";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from "recharts";
import { motion } from "framer-motion";

type DNAAnalysis = {
  title: string;
  summary: string;
  strengths: string[];
};

export default function DNAProfile() {
  const [dna, setDna] = useState<Traits | null>(null);
  const [analysis, setAnalysis] = useState<DNAAnalysis | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("travelDNA");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setDna(JSON.parse(saved));
    
    const savedAnalysis = localStorage.getItem("travelAnalysis");
    if (savedAnalysis) setAnalysis(JSON.parse(savedAnalysis));
  }, []);

  if (!dna) {
    return (
      <div className="glass-panel p-10 rounded-3xl animate-pulse flex flex-col items-start w-full border border-card-border/50">
        <div className="h-6 bg-muted rounded w-32 mb-8" />
        <div className="h-10 bg-muted rounded w-2/3 mb-4" />
        <div className="h-4 bg-muted rounded w-full mb-2" />
        <div className="h-4 bg-muted rounded w-5/6 mb-8" />
        <div className="h-64 bg-muted rounded w-full mt-4" />
      </div>
    );
  }

  // Format data for Recharts
  const data = Object.keys(dna).map((key) => ({
    subject: key,
    A: dna[key as keyof Traits],
    fullMark: 10,
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col gap-6"
    >
      <div className="glass-panel p-8 md:p-10 rounded-3xl w-full flex flex-col relative overflow-hidden bg-card/60 backdrop-blur-xl border border-card-border">
        <div className="flex flex-col items-start mb-8 pb-8 border-b border-card-border/60">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3">
            Behavioral Profile
          </h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
            {analysis?.title || "The Undiscovered Traveler"}
          </h3>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-md">
            {analysis?.summary || "Your unique travel behavior signature is being analyzed..."}
          </p>
          
          {analysis?.strengths && (
            <div className="flex flex-wrap gap-2 mt-6">
              {analysis.strengths.map((strength, idx) => (
                <span key={idx} className="px-3 py-1 bg-muted text-foreground text-xs font-semibold rounded-full border border-card-border">
                  {strength}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="w-full h-[300px] mt-4 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="var(--card-border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }} />
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
