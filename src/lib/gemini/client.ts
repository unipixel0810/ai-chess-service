import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export function getGeminiModel() {
  if (!genAI) {
    throw new Error("Gemini API key not configured");
  }
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

export function isGeminiAvailable(): boolean {
  return !!apiKey;
}
