import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from '../contexts/LanguageContext';

// Persistent cache to avoid redundant API calls across sessions
const CACHE_KEY = 'translation_cache_v1';
const loadCache = (): Record<string, string> => {
  try {
    const saved = localStorage.getItem(CACHE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

const translationCache = loadCache();

const saveCache = () => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(translationCache));
  } catch (e) {
    // Handle quota exceeded or other storage issues
    if (Object.keys(translationCache).length > 500) {
      // Clear half the cache if it gets too big
      const keys = Object.keys(translationCache);
      for (let i = 0; i < keys.length / 2; i++) {
        delete translationCache[keys[i]];
      }
    }
  }
};

// Global queue for batching requests
interface TranslationRequest {
  text: string;
  targetLang: Language;
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
}

let requestQueue: TranslationRequest[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

const langNames: Record<string, string> = {
  en: 'English', hi: 'Hindi', bn: 'Bengali', te: 'Telugu', mr: 'Marathi', 
  ta: 'Tamil', ur: 'Urdu', gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', 
  or: 'Odia', pa: 'Punjabi', as: 'Assamese', mai: 'Maithili', ks: 'Kashmiri', 
  ne: 'Nepali', kok: 'Konkani', sd: 'Sindhi', doi: 'Dogri', mni: 'Manipuri', 
  brx: 'Bodo', sa: 'Sanskrit', sat: 'Santali'
};

const processQueue = async () => {
  if (requestQueue.length === 0) return;

  const currentQueue = [...requestQueue];
  requestQueue = [];
  batchTimeout = null;

  // Group by language
  const byLang: Record<string, TranslationRequest[]> = {};
  currentQueue.forEach(req => {
    if (!byLang[req.targetLang]) byLang[req.targetLang] = [];
    byLang[req.targetLang].push(req);
  });

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  for (const lang of Object.keys(byLang) as Language[]) {
    const requests = byLang[lang];
    const uniqueTexts = Array.from(new Set(requests.map(r => r.text)));
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following array of strings to ${langNames[lang] || 'English'}. 
                   Maintain technical terms (like SSC, UPSC, RRB, ARMY, NAVY, AGNEEVEER, NEET, JEE).
                   Strings: ${JSON.stringify(uniqueTexts)}`,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          systemInstruction: "You are a professional translator for a government job notification website. Return a JSON array of translated strings in the exact same order as the input. Do not translate the website name 'Job Update' if it appears."
        }
      });
      
      const translatedArray = JSON.parse(response.text || "[]");
      const resultMap: Record<string, string> = {};
      
      if (Array.isArray(translatedArray)) {
        uniqueTexts.forEach((original, i) => {
          const translated = translatedArray[i] || original;
          resultMap[original] = translated;
          translationCache[`${lang}:${original}`] = translated;
        });
        saveCache();
      }

      // Resolve all requests for this language
      requests.forEach(req => {
        req.resolve(resultMap[req.text] || req.text);
      });
    } catch (error) {
      console.error(`Batch translation error for ${lang}:`, error);
      requests.forEach(req => req.resolve(req.text));
    }
  }
};

export function useTranslationService() {
  const [isTranslating, setIsTranslating] = useState(false);

  const translateContent = useCallback((text: string, targetLang: Language): Promise<string> => {
    if (!text || targetLang === 'en') return Promise.resolve(text);
    
    const cacheKey = `${targetLang}:${text}`;
    if (translationCache[cacheKey]) return Promise.resolve(translationCache[cacheKey]);
    
    return new Promise((resolve, reject) => {
      requestQueue.push({ text, targetLang, resolve, reject });
      
      if (!batchTimeout) {
        setIsTranslating(true);
        batchTimeout = setTimeout(() => {
          processQueue().finally(() => setIsTranslating(false));
        }, 150); // Wait 150ms to collect all requests from the page render
      }
    });
  }, []);

  const translateBatch = useCallback(async (texts: string[], targetLang: Language): Promise<string[]> => {
    if (texts.length === 0 || targetLang === 'en') return texts;
    return Promise.all(texts.map(t => translateContent(t, targetLang)));
  }, [translateContent]);

  return { translateContent, translateBatch, isTranslating };
}
