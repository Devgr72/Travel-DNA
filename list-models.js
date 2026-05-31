import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
async function run() {
  const models = ["gemini-pro", "gemini-1.0-pro", "gemini-1.5-flash", "models/gemini-1.5-flash"];
  for (const m of models) {
    try {
      await genAI.getGenerativeModel({ model: m }).generateContent("hello");
      console.log(m, "success");
    } catch(e) { console.error(m, "error:", e.message); }
  }
}
run().catch(console.error);
