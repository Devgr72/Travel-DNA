"use client";

import { useState } from "react";
import DNAProfile from "@/components/DNAProfile";
import ItineraryGenerator from "@/components/ItineraryGenerator";
import AdaptiveItinerary from "@/components/AdaptiveItinerary";

export default function Dashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tripData, setTripData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (data: { destination: string; duration: string; budget: string }) => {
    setIsLoading(true);
    try {
      const traits = localStorage.getItem("travelDNA");
      const response = await fetch("/api/generate-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, traits: traits ? JSON.parse(traits) : null }),
      });

      if (!response.ok) throw new Error("Failed to generate");
      const result = await response.json();
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
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Travel Command Center</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 space-y-8">
            <DNAProfile />
            <ItineraryGenerator onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
          
          <div className="lg:col-span-8 h-full">
            {tripData ? (
              <AdaptiveItinerary 
                initialTripData={tripData} 
              />
            ) : (
              <div className="glass-panel p-12 rounded-3xl h-full flex flex-col items-center justify-center text-center border border-dashed border-card-border/50 bg-card/20 min-h-[600px]">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 shadow-sm border border-card-border">
                  <span className="text-3xl opacity-50">✦</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">Awaiting Parameters</h3>
                <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                  Enter your destination details to synthesize your behavioral profile into a dynamic, AI-generated travel experience.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
