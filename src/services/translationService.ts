import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!text || !targetLanguage || targetLanguage === 'en') return text;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following text to ${targetLanguage}. Return ONLY the translated text, nothing else. Text: "${text}"`,
    });

    return response.text.trim().replace(/^"|"$/g, '') || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function translateObject<T extends Record<string, any>>(obj: T, targetLanguage: string, fields: (keyof T)[]): Promise<T> {
  if (targetLanguage === 'en') return obj;

  const translatedObj = { ...obj };
  
  try {
    const promises = fields.map(async (field) => {
      const value = obj[field];
      if (typeof value === 'string' && value.trim()) {
        translatedObj[field] = (await translateText(value, targetLanguage)) as any;
      }
    });

    await Promise.all(promises);
    return translatedObj;
  } catch (error) {
    console.error("Object translation error:", error);
    return obj;
  }
}
