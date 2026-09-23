import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const GEMINI_MODEL = "gemini-3.5-flash-lite";

/**
 * Get configured Gemini model for performance analysis
 * Using Gemini Flash-Lite for lower latency and high-throughput analysis.
 */
export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,  // Increased for complete JSON response
      responseMimeType: "application/json",  // Force JSON output
    },
  });
}
