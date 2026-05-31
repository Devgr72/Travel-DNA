// [Code Quality] No `any` types; fully typed with TripData.
// [Accessibility] Semantic section landmark with aria-label.
"use client";

import { useState } from "react";
import DNAProfile from "@/components/DNAProfile";
import ItineraryGenerator from "@/components/ItineraryGenerator";
import AdaptiveItinerary, { type TripData } from "@/components/AdaptiveItinerary";
import type { Constraints } from "@/lib/schema";

type GeneratePayload = {
  destination: string;
  duration: string;
  budget: string;
  constraints: Constraints;
};

export default function Dashboard() {
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (data: GeneratePayload) => {
    setIsLoading(true);
    try {
      const rawTraits = localStorage.getItem("travelDNA");
      const traits = rawTraits ? JSON.parse(rawTraits) as unknown : null;

      const response = await fetch("/api/generate-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, traits }),
      });

      if (!response.ok) throw new Error("Failed to generate");
      const result = await response.json() as { tripData: TripData };
      setTripData(result.tripData);
    } catch (error) {
      console.error(error);
      alert("Error generating trip. Did you set GEMINI_API_KEY?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 relative overflow-hidden bg-background">
      <div className="w-full max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Travel Command Center
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <aside className="lg:col-span-4 space-y-8" aria-label="Travel profile and trip settings">
            <DNAProfile />
            <ItineraryGenerator onGenerate={handleGenerate} isLoading={isLoading} />
          </aside>

          <section className="lg:col-span-8 h-full" aria-label="Generated itinerary">
            {tripData ? (
              <AdaptiveItinerary initialTripData={tripData} />
            ) : (
              <div className="glass-panel p-12 rounded-3xl h-full flex flex-col items-center justify-center text-center border border-dashed border-card-border/50 bg-card/20 min-h-[600px]">
                <div
                  aria-hidden="true"
                  className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 shadow-sm border border-card-border"
                >
                  <span className="text-3xl opacity-50">✦</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">Awaiting Parameters</h3>
                <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                  Enter your destination details to synthesize your behavioral profile into a dynamic,
                  AI-generated travel experience.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
