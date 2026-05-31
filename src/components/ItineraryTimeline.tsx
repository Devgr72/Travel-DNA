"use client";

import { motion } from "framer-motion";
import { MapPin, Utensils, Moon, Navigation, Landmark, Sun, Heart, Tent } from "lucide-react";

type Activity = {
  time: string;
  description: string;
  type: string;
};

type Day = {
  day: number;
  title: string;
  activities: Activity[];
};

export type ItineraryData = {
  days: Day[];
};

const getTypeIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("food")) return Utensils;
  if (t.includes("culture")) return Landmark;
  if (t.includes("adventure")) return Tent;
  if (t.includes("luxury")) return Heart;
  if (t.includes("social")) return Moon;
  if (t.includes("exploration")) return MapPin;
  if (t.includes("logistics")) return Navigation;
  return Sun;
};

export default function ItineraryTimeline({ data }: { data: ItineraryData }) {
  if (!data || !data.days || data.days.length === 0) {
    return <div className="text-muted-foreground italic">No itinerary data available.</div>;
  }

  return (
    <div className="relative border-l border-card-border ml-4 md:ml-8 pb-12">
      {data.days.map((day, dayIdx) => (
        <div key={dayIdx} className="mb-14 relative">
          
          {/* Day Marker */}
          <div className="absolute -left-[25px] md:-left-[29px] top-0 bg-background w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center border border-card-border shadow-sm z-10">
            <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Day</span>
            <span className="text-base md:text-lg font-extrabold text-foreground leading-none">{day.day}</span>
          </div>

          <div className="pl-10 md:pl-12 pt-1">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-8 tracking-tight">{day.title}</h3>

            <div className="space-y-6">
              {day.activities.map((activity, actIdx) => {
                const Icon = getTypeIcon(activity.type);
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (dayIdx * 0.1) + (actIdx * 0.05), ease: [0.16, 1, 0.3, 1] }}
                    key={actIdx} 
                    className="relative group"
                  >
                    {/* Activity connector line */}
                    {actIdx !== day.activities.length - 1 && (
                      <div className="absolute left-5 top-12 bottom-[-24px] w-[1px] bg-card-border" />
                    )}

                    <div className="flex gap-4 md:gap-5">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted border border-card-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all shadow-sm z-10">
                        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                      </div>
                      
                      <div className="flex-1 bg-card border border-card-border p-5 rounded-2xl group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2.5 gap-2">
                          <span className="text-xs font-bold text-foreground tracking-wider uppercase">
                            {activity.time}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 bg-muted rounded-md text-muted-foreground inline-block w-fit">
                            {activity.type}
                          </span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
