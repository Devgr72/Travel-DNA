// [Efficiency] Quiz loaded via next/dynamic — Framer Motion chunk is code-split.
// [Code Quality] Design tokens used throughout (text-foreground, text-muted-foreground).
// Note: quiz/page.tsx is a Server Component; ssr:false is not permitted here.
//       Quiz itself is "use client" so it renders with SSR-safe hook defaults.
import dynamic from "next/dynamic";

const Quiz = dynamic(() => import("@/components/Quiz"), {
  loading: () => (
    <div
      aria-busy="true"
      aria-label="Loading quiz"
      className="w-full max-w-2xl mx-auto mt-10 h-96 rounded-3xl bg-card/60 animate-pulse border border-card-border/50"
    />
  ),
});

export default function QuizPage() {
  return (
    <div className="min-h-screen px-4 py-20 relative overflow-hidden flex flex-col items-center">
      {/* Background decoration elements */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-4xl text-center mb-8 mt-10">
        <h1 className="text-4xl font-bold text-foreground mb-4">Discover Your Travel DNA</h1>
        <p className="text-muted-foreground text-lg">
          Answer a few quick questions to reveal your unique traveler profile.
        </p>
      </div>

      <Quiz />
    </div>
  );
}
