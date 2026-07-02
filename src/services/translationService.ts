// Removed GoogleGenAI import because translation is now done on the backend.

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!text || !targetLanguage || targetLanguage === 'en') return text;

  try {
    const response = await fetch('/api/gemini/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to translate');
    }
    
    return data.text || text;
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
