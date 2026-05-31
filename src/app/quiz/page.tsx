import Quiz from "@/components/Quiz";

export default function QuizPage() {
  return (
    <div className="min-h-screen px-4 py-20 relative overflow-hidden flex flex-col items-center">
      {/* Background decoration elements */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-4xl text-center mb-8 mt-10">
        <h1 className="text-4xl font-bold text-white mb-4">Discover Your Travel DNA</h1>
        <p className="text-slate-400 text-lg">Answer a few quick questions to reveal your unique traveler profile.</p>
      </div>

      <Quiz />
    </div>
  );
}
