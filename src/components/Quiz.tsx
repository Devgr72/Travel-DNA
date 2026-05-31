"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export type Traits = {
  Adventure: number;
  Food: number;
  Culture: number;
  Luxury: number;
  Social: number;
  Exploration: number;
};

const questions = [
  {
    question: "It's 8:00 AM on your vacation. Where are you?",
    options: [
      { text: "Still asleep, vacation is for resting.", traits: { Luxury: 2, Adventure: -1 } },
      { text: "Already out the door, grabbing coffee and exploring.", traits: { Exploration: 2, Adventure: 1 } },
      { text: "Waking up slowly with a nice breakfast.", traits: { Food: 1, Luxury: 1 } },
      { text: "Heading out for an early morning hike or run.", traits: { Adventure: 2, Exploration: 1 } },
    ],
  },
  {
    question: "How do you prefer to experience local food?",
    options: [
      { text: "Finding the highest-rated fine dining restaurant.", traits: { Luxury: 2, Food: 1 } },
      { text: "Scouring street food markets for authentic bites.", traits: { Food: 2, Exploration: 1 } },
      { text: "A mix of nice restaurants and casual cafes.", traits: { Food: 1 } },
      { text: "Cooking classes to learn the local cuisine.", traits: { Culture: 2, Food: 1 } },
    ],
  },
  {
    question: "What's your ideal afternoon activity?",
    options: [
      { text: "Visiting a famous museum or historical site.", traits: { Culture: 2 } },
      { text: "Getting lost in a new neighborhood.", traits: { Exploration: 2 } },
      { text: "Lounging by the pool or at a spa.", traits: { Luxury: 2 } },
      { text: "Bungee jumping or a local outdoor excursion.", traits: { Adventure: 2 } },
    ],
  },
  {
    question: "How do you navigate a new city?",
    options: [
      { text: "I map out everything in advance.", traits: { Culture: 1, Luxury: 1 } },
      { text: "I just walk and see where the wind takes me.", traits: { Exploration: 2 } },
      { text: "I use local public transit to feel like a local.", traits: { Culture: 1, Exploration: 1 } },
      { text: "I prefer taking taxis or private cars everywhere.", traits: { Luxury: 2 } },
    ],
  },
  {
    question: "When it comes to socializing on trips:",
    options: [
      { text: "I love meeting locals and other travelers.", traits: { Social: 2 } },
      { text: "I prefer sticking with my travel companions.", traits: { Social: -1 } },
      { text: "I enjoy solitary moments for reflection.", traits: { Social: -2, Exploration: 1 } },
      { text: "I like organized group tours.", traits: { Social: 1, Culture: 1 } },
    ],
  },
  {
    question: "Your accommodation style is:",
    options: [
      { text: "A 5-star hotel with all amenities.", traits: { Luxury: 2 } },
      { text: "A boutique hotel with local charm.", traits: { Culture: 1, Luxury: 1 } },
      { text: "A cozy Airbnb in a residential neighborhood.", traits: { Exploration: 1, Culture: 1 } },
      { text: "A hostel or camping out.", traits: { Adventure: 1, Social: 1 } },
    ],
  },
  {
    question: "What's your approach to a rainy day?",
    options: [
      { text: "Perfect excuse for a museum or gallery day.", traits: { Culture: 2 } },
      { text: "Shopping and indoor dining.", traits: { Luxury: 1, Food: 1 } },
      { text: "Embrace it! Put on a raincoat and explore anyway.", traits: { Adventure: 2 } },
      { text: "Stay in the room, order room service, and relax.", traits: { Luxury: 2 } },
    ],
  },
  {
    question: "If you had an unexpected free day, you would:",
    options: [
      { text: "Go on a spontaneous day trip to a nearby town.", traits: { Exploration: 2, Adventure: 1 } },
      { text: "Book a high-end spa treatment.", traits: { Luxury: 2 } },
      { text: "Spend the entire day cafe-hopping and trying foods.", traits: { Food: 2 } },
      { text: "Visit cultural landmarks you missed.", traits: { Culture: 2 } },
    ],
  },
  {
    question: "When packing your suitcase, what's essential?",
    options: [
      { text: "Multiple elegant outfits for dinners out.", traits: { Luxury: 2 } },
      { text: "Hiking boots and a waterproof jacket.", traits: { Adventure: 2 } },
      { text: "A good camera and comfortable walking shoes.", traits: { Exploration: 2, Culture: 1 } },
      { text: "Just the basics, I'll buy what I need there.", traits: { Exploration: 1, Social: 1 } },
    ],
  },
  {
    question: "The best part about traveling is:",
    options: [
      { text: "Discovering completely unfamiliar ways of life.", traits: { Culture: 2, Exploration: 1 } },
      { text: "Tasting unique flavors you can't get at home.", traits: { Food: 2 } },
      { text: "The thrill of stepping out of your comfort zone.", traits: { Adventure: 2 } },
      { text: "Escaping stress and being pampered.", traits: { Luxury: 2 } },
    ],
  }
];

export default function Quiz() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Traits>({
    Adventure: 0, Food: 0, Culture: 0, Luxury: 0, Social: 0, Exploration: 0,
  });
  const [isCalculating, setIsCalculating] = useState(false);

  const handleOptionSelect = (optionTraits: Partial<Traits>) => {
    setScores((prev) => {
      const newScores = { ...prev };
      for (const [trait, value] of Object.entries(optionTraits)) {
        newScores[trait as keyof Traits] += value;
      }
      return newScores;
    });

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep((prev) => prev + 1), 250);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsCalculating(true);
    
    await new Promise(r => setTimeout(r, 1000));
    
    try {
      const response = await fetch("/api/analyze-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traits: scores })
      });
      if (response.ok) {
        const { analysis } = await response.json();
        localStorage.setItem("travelAnalysis", JSON.stringify(analysis));
      }
    } catch (e) {
      console.error(e);
    }
    
    localStorage.setItem("travelDNA", JSON.stringify(scores));
    router.push("/dashboard");
  };

  if (isCalculating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-16 h-16 border-4 border-muted border-t-primary border-r-primary/50 rounded-full mb-8 shadow-xl"
        />
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-foreground mb-3 tracking-tight"
        >
          Analyzing Travel DNA
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground text-sm font-medium"
        >
          Consulting AI to generate your archetype...
        </motion.p>
      </div>
    );
  }

  const question = questions[currentStep];
  const progress = ((currentStep) / questions.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      {/* Premium Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between text-xs text-muted-foreground mb-3 font-semibold tracking-wide uppercase">
          <span>Question {currentStep + 1} / {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: `${((currentStep) / questions.length) * 100}%` }}
            animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card p-8 md:p-12 rounded-3xl border border-card-border shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 leading-snug tracking-tight">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleOptionSelect(option.traits)}
                className="w-full text-left p-5 rounded-2xl bg-card border border-card-border hover:border-muted-foreground/30 hover:bg-muted/50 transition-all group flex items-center justify-between"
              >
                <span className="text-foreground/90 font-medium text-lg leading-relaxed">
                  {option.text}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors ml-4 flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
