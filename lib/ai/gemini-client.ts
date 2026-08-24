import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get configured Gemini model for performance analysis
 * Using gemini-3.6-flash (latest available model)
 */
export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,  // Increased for complete JSON response
      responseMimeType: "application/json",  // Force JSON output
    },
  });
}
