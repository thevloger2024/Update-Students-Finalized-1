import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON and urlencoded data
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Initialize Gemini API
  const getAiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    return new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // API Routes
  app.post('/api/gemini/thumbnail', async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      const thumbnails: string[] = [];
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            thumbnails.push(`data:image/png;base64,${part.inlineData.data}`);
          }
        }
      }

      res.json({ thumbnails });
    } catch (error: any) {
      console.error('Gemini thumbnail error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate thumbnail' });
    }
  });

  app.post('/api/gemini/variations', async (req, res) => {
    try {
      const { base64Data, mimeType } = req.body;
      const ai = getAiClient();
      
      const prompts = [
        'Generate a variation of this thumbnail with a different color palette but keeping the same professional theme.',
        'Generate a variation of this thumbnail with a more modern and minimalist layout.',
        'Generate a variation of this thumbnail with more vibrant and energetic visual elements.'
      ];

      const results = await Promise.all(prompts.map(prompt => 
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: prompt }
            ]
          },
        })
      ));

      const thumbnails: string[] = [];
      results.forEach(response => {
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              thumbnails.push(`data:image/png;base64,${part.inlineData.data}`);
            }
          }
        }
      });

      res.json({ thumbnails });
    } catch (error: any) {
      console.error('Gemini variations error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate variations' });
    }
  });

  app.post('/api/gemini/auto-fill', async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = getAiClient();
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          toolConfig: { includeServerSideToolInvocations: true }
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini auto-fill error:', error);
      res.status(500).json({ error: error.message || 'Failed to auto-fill' });
    }
  });

  app.post('/api/gemini/translate', async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      const ai = getAiClient();
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Translate the following text to ${targetLanguage}. Return ONLY the translated text, nothing else. Text: "${text}"`,
      });

      res.json({ text: response.text.trim().replace(/^"|"$/g, '') || text });
    } catch (error: any) {
      console.error('Gemini translation error:', error);
      res.status(500).json({ error: error.message || 'Failed to translate' });
    }
  });

  app.post('/api/gemini/extract-questions', async (req, res) => {
    try {
      const { base64Data, mimeType, orgName, year } = req.body;
      const ai = getAiClient();
      
      const prompt = `Extract up to 90 multiple-choice questions (or all available if less) from this document for the ${orgName} from year ${year}. 
                     Return a JSON array of objects. Each object must have: 
                     'question' (string), 
                     'options' (array of exactly 4 strings), 
                     'correctIndex' (number from 0 to 3 indicating the correct option),
                     'explanation' (optional string explaining the answer).
                     Ensure the output is valid JSON and strictly follows the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt }
          ]
        }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctIndex: { type: Type.NUMBER },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctIndex"]
            }
          }
        }
      });

      let jsonText = response.text.trim();
      res.json(JSON.parse(jsonText));
    } catch (error: any) {
      console.error('Gemini extract questions error:', error);
      res.status(500).json({ error: error.message || 'Failed to extract questions' });
    }
  });

  app.post('/api/gemini/generate-json', async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = getAiClient();
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      let jsonText = response.text.trim();
      res.json(JSON.parse(jsonText));
    } catch (error: any) {
      console.error('Gemini generate-json error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate JSON' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For Express 4.x
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
