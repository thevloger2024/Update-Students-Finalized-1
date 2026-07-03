import { GoogleGenAI } from '@google/genai';

// Initialize Gemini Client directly in the browser for static hosting (Firebase)
// Note: In production static sites, the VITE_GEMINI_API_KEY is exposed to the client.
// This is acceptable for Admin-only features, but be aware of the security implications.

const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);

if (!apiKey) {
  console.error("Missing VITE_GEMINI_API_KEY! AI features will not work.");
}

export const aiClient = new GoogleGenAI({
  apiKey: apiKey || '',
});

export const HIGH_THINKING_CONFIG = {
  thinkingConfig: {
    thinkingBudget: 8192,
  }
};
