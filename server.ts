import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

// Support both GEMINI_API_KEY (server) and VITE_GEMINI_API_KEY (GitHub Actions secret)
if (!process.env.GEMINI_API_KEY && process.env.VITE_GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
}


// ─────────────────────────────────────────────────────────────
// 🧠 CENTRALIZED AI CLIENT WITH HIGH THINKING ENABLED
// ─────────────────────────────────────────────────────────────
const getAiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment variables");
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build' }
    }
  });
};

// High Thinking config — applied to ALL text generation calls
const HIGH_THINKING_CONFIG = {
  thinkingConfig: {
    thinkingBudget: 8192,
    includeThoughts: false  // Don't expose thought tokens to client
  }
};

// Model constants
const THINKING_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'gemini-2.0-flash-preview-image-generation';

// ─────────────────────────────────────────────────────────────
// ⚡ IN-MEMORY RESPONSE CACHE (1 hour TTL)
// ─────────────────────────────────────────────────────────────
interface CacheEntry {
  data: any;
  expiresAt: number;
}
const responseCache = new Map<string, CacheEntry>();

function getCached(key: string): any | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: any, ttlMs: number = 3600000): void {
  responseCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ─────────────────────────────────────────────────────────────
// 📐 ASPECT RATIO LOOKUP TABLE BY CONTENT TYPE
// ─────────────────────────────────────────────────────────────
const ASPECT_RATIO_MAP: Record<string, { ratio: string; width: number; height: number }> = {
  'job':          { ratio: '16:9', width: 1280, height: 720 },
  'admit_card':   { ratio: '16:9', width: 1280, height: 720 },
  'result':       { ratio: '16:9', width: 1280, height: 720 },
  'scholarship':  { ratio: '16:9', width: 1280, height: 720 },
  'quiz':         { ratio: '4:3',  width: 1200, height: 900 },
  'social':       { ratio: '1:1',  width: 1080, height: 1080 },
  'portrait':     { ratio: '9:16', width: 720,  height: 1280 },
  'default':      { ratio: '16:9', width: 1280, height: 720 },
};

// ─────────────────────────────────────────────────────────────
// 📧 EMAIL ALERT HELPER
// ─────────────────────────────────────────────────────────────
async function sendAdminAlert(subject: string, body: string): Promise<void> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('[Email Alert] SMTP credentials not configured. Skipping email.');
      return;
    }
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: `"Website Intelligence" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || 'thevloger2024@gmail.com',
      subject: `🚨 [Website Alert] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e3a5f; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">🚨 Website Intelligence Alert</h2>
            <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
            <pre style="white-space: pre-wrap; font-family: monospace; font-size: 13px; color: #334155; background: white; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">${body}</pre>
          </div>
        </div>
      `,
    });
    console.log(`[Email Alert] Sent: ${subject}`);
  } catch (err) {
    console.error('[Email Alert] Failed to send:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// 🔥 ERROR LOG STORE (In-Memory + Firestore-ready)
// ─────────────────────────────────────────────────────────────
interface ErrorLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  url?: string;
  stack?: string;
  autoFixed: boolean;
}
const errorLogs: ErrorLog[] = [];

function logError(type: string, message: string, url?: string, stack?: string) {
  const entry: ErrorLog = {
    id: `err_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    timestamp: new Date().toISOString(),
    type,
    message,
    url,
    stack,
    autoFixed: false,
  };
  errorLogs.unshift(entry);
  if (errorLogs.length > 200) errorLogs.pop(); // Keep last 200 errors
  
  // Send email for critical errors
  sendAdminAlert(`${type}: ${message.slice(0, 80)}`, JSON.stringify(entry, null, 2));
  return entry;
}

// ─────────────────────────────────────────────────────────────
// 🌐 INTELLIGENCE: SOURCE URLS & ACTIVITY LOG
// ─────────────────────────────────────────────────────────────
interface SourceURL {
  id: string;
  url: string;
  name: string;
  addedAt: string;
  lastScraped?: string;
}
interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status: 'success' | 'failed' | 'pending';
}

const sourceURLs: SourceURL[] = [];
const activityLogs: ActivityLog[] = [];
let autoPublishEnabled = false;

function logActivity(action: string, details: string, status: 'success' | 'failed' | 'pending' = 'success') {
  const entry: ActivityLog = {
    id: `act_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    status,
  };
  activityLogs.unshift(entry);
  if (activityLogs.length > 500) activityLogs.pop();
  console.log(`[Intelligence] ${action}: ${details}`);
}

// ─────────────────────────────────────────────────────────────
// 🚀 MAIN SERVER
// ─────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000');

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ── CORS for dev ──────────────────────────────────────────
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  // ─────────────────────────────────────────────────────────
  // 🖼️ F4: THUMBNAIL GENERATION (Aspect-Ratio Aware + High Quality)
  // ─────────────────────────────────────────────────────────
  app.post('/api/gemini/thumbnail', async (req, res) => {
    try {
      const { prompt, contentType = 'default' } = req.body;
      const ai = getAiClient();
      
      // Get correct aspect ratio from lookup table
      const aspectInfo = ASPECT_RATIO_MAP[contentType] || ASPECT_RATIO_MAP['default'];
      
      // High-quality prompt engineering
      const enhancedPrompt = `Create a professional, high-quality thumbnail image for an Indian government jobs/education portal.
Topic: ${prompt}
Style: Clean, professional, modern design with vibrant colors. Government/education theme.
Requirements: Sharp text if any, high contrast, visually striking, ultra-detailed, ${aspectInfo.width}x${aspectInfo.height} pixels.
Color palette: Deep blue (#1e3a5f), saffron orange (#ff6b35), white — Indian government aesthetic.
Quality: Ultra HD, photorealistic or clean illustration style, no blur, no artifacts.`;

      const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: { parts: [{ text: enhancedPrompt }] },
        config: {
          responseModalities: ['IMAGE', 'TEXT'],
          imageConfig: { aspectRatio: aspectInfo.ratio as any }
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

      logActivity('Thumbnail Generated', `Type: ${contentType}, Ratio: ${aspectInfo.ratio}, Prompt: "${prompt.slice(0,60)}..."`);
      res.json({ thumbnails, aspectRatio: aspectInfo.ratio, dimensions: `${aspectInfo.width}x${aspectInfo.height}` });
    } catch (error: any) {
      console.error('Thumbnail error:', error);
      logError('ThumbnailError', error.message);
      res.status(500).json({ error: error.message || 'Failed to generate thumbnail' });
    }
  });

  // ─────────────────────────────────────────────────────────
  // 🖼️ THUMBNAIL VARIATIONS (with High Thinking)
  // ─────────────────────────────────────────────────────────
  app.post('/api/gemini/variations', async (req, res) => {
    try {
      const { base64Data, mimeType, contentType = 'default' } = req.body;
      const ai = getAiClient();
      const aspectInfo = ASPECT_RATIO_MAP[contentType] || ASPECT_RATIO_MAP['default'];
      
      const prompts = [
        'Generate a variation of this thumbnail with a vibrant saffron and deep blue color scheme. Professional Indian government portal style.',
        'Generate a variation with a modern minimalist layout — clean white background, bold typography, subtle gradient accents.',
        'Generate a variation with a dramatic dark background, glowing text effects, and patriotic red-white-green color accents.',
      ];

      const results = await Promise.all(prompts.map(prompt =>
        ai.models.generateContent({
          model: IMAGE_MODEL,
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: prompt + ` Dimensions: ${aspectInfo.width}x${aspectInfo.height}. Ultra HD quality.` }
            ]
          },
          config: {
            responseModalities: ['IMAGE', 'TEXT'],
            imageConfig: { aspectRatio: aspectInfo.ratio as any }
          }
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
      console.error('Variations error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate variations' });
    }
  });

  // ─────────────────────────────────────────────────────────
  // 🖼️ F3: IMAGE ANALYSIS (Gemini Multimodal + High Thinking)
  // ─────────────────────────────────────────────────────────
  app.post('/api/gemini/analyze-image', async (req, res) => {
    try {
      const { base64Data, mimeType = 'image/jpeg' } = req.body;
      if (!base64Data) return res.status(400).json({ error: 'base64Data is required' });
      
      const ai = getAiClient();
      const analysisPrompt = `You are an expert image analyzer for an Indian government jobs/education website.
Analyze this image thoroughly and return a JSON object with these exact fields:
{
  "description": "Detailed description of what's in the image",
  "extractedText": "Any visible text in the image (OCR)",
  "suggestedTitle": "A catchy SEO-friendly title if this were a post thumbnail",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "suggestedCategory": "job|admit_card|result|scholarship|quiz|other",
  "qualityScore": 85,
  "qualityFeedback": "Feedback about image quality and suitability as thumbnail",
  "dominantColors": ["#hex1", "#hex2"],
  "contentType": "photo|illustration|document|screenshot|graphic",
  "isAppropriate": true
}
Only return valid JSON, no extra text.`;

      const response = await ai.models.generateContent({
        model: THINKING_MODEL,
        contents: [{
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: analysisPrompt }
          ]
        }],
        config: {
          ...HIGH_THINKING_CONFIG,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              extractedText: { type: Type.STRING },
              suggestedTitle: { type: Type.STRING },
              suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedCategory: { type: Type.STRING },
              qualityScore: { type: Type.NUMBER },
              qualityFeedback: { type: Type.STRING },
              dominantColors: { type: Type.ARRAY, items: { type: Type.STRING } },
              contentType: { type: Type.STRING },
              isAppropriate: { type: Type.BOOLEAN },
            },
            required: ['description', 'suggestedTitle', 'suggestedTags', 'suggestedCategory', 'qualityScore', 'isAppropriate']
          }
        }
      });

      const result = JSON.parse(response.text?.trim() || '{}');
      logActivity('Image Analyzed', `Quality Score: ${result.qualityScore}, Category: ${result.suggestedCategory}`);
      res.json(result);
    } catch (error: any) {
      console.error('Image analysis error:', error);
      res.status(500).json({ error: error.message || 'Failed to analyze image' });
    }
  });


  // ─────────────────────────────────────────────────────────
  // 🏷️ SUGGEST TAGS & CATEGORY
  // ─────────────────────────────────────────────────────────
  app.post('/api/gemini/suggest-tags', async (req, res) => {
    try {
      const { description } = req.body;
      const ai = getAiClient();
      const prompt = `Analyze the following description for an educational/job/admit card/result/scholarship update and suggest the most appropriate category and a list of up to 5 relevant tags.

Description: "${description}"

Return ONLY a valid JSON object in this format:
{
  "category": "category name here",
  "type": "job|admit_card|result|scholarship|updates",
  "tags": ["tag1", "tag2", "tag3"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });
      const result = JSON.parse(response.text?.trim() || '{}');
      res.json(result);
    } catch (error: any) {
      console.error('Suggest tags error:', error);
      res.status(500).json({ error: error.message || 'Failed to suggest tags' });
    }
  });

  // ─────────────────────────────────────────────────────────
  // ✍️ AUTO-FILL (High Thinking + Google Search)

  // ─────────────────────────────────────────────────────────
  app.post('/api/gemini/auto-fill', async (req, res) => {
    try {
      const { prompt } = req.body;
      const cacheKey = `autofill:${prompt}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json({ text: cached, fromCache: true });

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: THINKING_MODEL,
        contents: prompt,
        config: {
          ...HIGH_THINKING_CONFIG,
          tools: [{ googleSearch: {} }],
        }
      });

      const text = response.text;
      setCache(cacheKey, text, 1800000); // 30 min cache for auto-fill
      res.json({ text, fromCache: false });
    } catch (error: any) {
      console.error('Auto-fill error:', error);
      res.status(500).json({ error: error.message || 'Failed to auto-fill' });
    }
  });

  // ─────────────────────────────────────────────────────────
  // 🌐 TRANSLATE (High Thinking)
  // ─────────────────────────────────────────────────────────
  app.post('/api/gemini/translate', async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      const cacheKey = `translate:${targetLanguage}:${text.slice(0,100)}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json({ text: cached, fromCache: true });

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: THINKING_MODEL,
        contents: `Translate the following text to ${targetLanguage}. Return ONLY the translated text, nothing else.\n\nText: "${text}"`,
        config: HIGH_THINKING_CONFIG,
      });

      const translated = response.text?.trim().replace(/^"|"$/g, '') || text;
      setCache(cacheKey, translated, 86400000); // 24 hr cache for translations
      res.json({ text: translated, fromCache: false });
    } catch (error: any) {
      console.error('Translation error:', error);
      res.status(500).json({ error: error.message || 'Failed to translate' });
    }
  });

  // ─────────────────────────────────────────────────────────
  // 📄 EXTRACT QUESTIONS FROM PDF/IMAGE (High Thinking + Multimodal)
  // ─────────────────────────────────────────────────────────
  app.post('/api/gemini/extract-questions', async (req, res) => {
    try {
      const { base64Data, mimeType, orgName, year } = req.body;
      const ai = getAiClient();

      const prompt = `You are an expert at extracting exam questions. Extract up to 90 multiple-choice questions from this document for the ${orgName} exam from year ${year}.
Think carefully about each question. Make sure the correct answer index is accurate.
Return a valid JSON array. Each object must have:
- question: the full question text
- options: exactly 4 answer options as strings
- correctIndex: number 0-3 indicating the correct answer
- explanation: brief explanation of why this answer is correct`;

      const response = await ai.models.generateContent({
        model: THINKING_MODEL,
        contents: [{
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt }
          ]
        }],
        config: {
          ...HIGH_THINKING_CONFIG,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.NUMBER },
                explanation: { type: Type.STRING }
              },
              required: ['question', 'options', 'correctIndex']
            }
          }
        }
      });

      const result = JSON.parse(response.text?.trim() || '[]');
      logActivity('Questions Extracted', `${result.length} questions from ${orgName} ${year}`);
      res.json(result);
    } catch (error: any) {
      console.error('Extract questions error:', error);
      res.status(500).json({ error: error.message || 'Failed to extract questions' });
    }
  });

  // ─────────────────────────────────────────────────────────
  // 📊 GENERATE JSON (High Thinking)
  // ─────────────────────────────────────────────────────────
  app.post('/api/gemini/generate-json', async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = getAiClient();

      const response = await ai.models.generateContent({
        model: THINKING_MODEL,
        contents: prompt,
        config: {
          ...HIGH_THINKING_CONFIG,
          responseMimeType: 'application/json'
        }
      });

      const result = JSON.parse(response.text?.trim() || '{}');
      res.json(result);
    } catch (error: any) {
      console.error('Generate JSON error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate JSON' });
    }
  });

  // ─────────────────────────────────────────────────────────
  // ⚡ F2: STREAMING AI ENDPOINT
  // ─────────────────────────────────────────────────────────
  app.post('/api/gemini/stream', async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      const ai = getAiClient();

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const streamResponse = await ai.models.generateContentStream({
        model: THINKING_MODEL,
        contents: prompt,
        config: {
          ...HIGH_THINKING_CONFIG,
          ...(systemInstruction ? { systemInstruction } : {}),
        }
      });

      for await (const chunk of streamResponse) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error('Streaming error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  });

  // ─────────────────────────────────────────────────────────
  // 🤖 F5: ADMIN AI CHATBOT (High Thinking + Streaming)
  // ─────────────────────────────────────────────────────────
  app.post('/api/gemini/admin-chat', async (req, res) => {
    try {
      const { message, conversationHistory = [], websiteContext = {} } = req.body;

      const systemInstruction = `You are an expert AI admin assistant for an Indian government jobs and education website.

WEBSITE CONTEXT:
- Platform: StudentUpdate / Sarkari Naukri portal
- Admin Email: thevloger2024@gmail.com
- Content Types: Job notifications, Admit Cards, Results, Scholarships, Quizzes
- Tech Stack: React + Firebase + Gemini AI

YOUR CAPABILITIES (you can help admin perform these tasks):
1. CREATE_POST — Create a new update post (job/admit_card/result/scholarship)
2. GENERATE_QUIZ — Generate quiz questions on any topic
3. GENERATE_THUMBNAIL — Create thumbnail for a post
4. GET_STATS — Summarize website statistics
5. REVIEW_CONTENT — Review and improve existing content
6. DRAFT_CONTENT — Draft content for review before publishing
7. ANALYZE_DATA — Analyze quiz performance, user data
8. ERROR_REVIEW — Review recent website errors
9. INTELLIGENCE_STATUS — Check autonomous intelligence status

IMPORTANT RULES:
- Always think deeply before responding
- For destructive actions (delete, bulk changes), ALWAYS ask for explicit confirmation first
- Respond in the same language the admin uses (Hindi or English)
- Be concise but thorough
- When creating content, provide complete, well-formatted data
- Never make up or hallucinate data — always state when you're generating sample data

CURRENT CONTEXT:
${JSON.stringify(websiteContext, null, 2)}

When you want to trigger an action, include a JSON block at the END of your response in this format:
\`\`\`action
{"type": "CREATE_POST|GENERATE_QUIZ|GENERATE_THUMBNAIL|etc", "data": {...}}
\`\`\``;

      const ai = getAiClient();

      // Build conversation contents
      const contents: any[] = [];
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.role,
          parts: [{ text: msg.content }]
        });
      }
      contents.push({ role: 'user', parts: [{ text: message }] });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const streamResponse = await ai.models.generateContentStream({
        model: THINKING_MODEL,
        contents,
        config: {
          ...HIGH_THINKING_CONFIG,
          systemInstruction,
          tools: [{ googleSearch: {} }],
        }
      });

      for await (const chunk of streamResponse) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();

      logActivity('Admin Chatbot', `Admin query: "${message.slice(0, 80)}"`);
    } catch (error: any) {
      console.error('Admin chat error:', error);
      logError('AdminChatError', error.message);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  });

  // ─────────────────────────────────────────────────────────
  // 🧠 F6: AUTONOMOUS INTELLIGENCE — GENERATE CONTENT FROM URL/TOPIC
  // ─────────────────────────────────────────────────────────
  app.post('/api/intelligence/generate-post', async (req, res) => {
    try {
      const { topic, sourceUrl, targetType = 'job' } = req.body;
      const ai = getAiClient();

      const prompt = `You are an expert content writer for an Indian government jobs and education portal.
${sourceUrl ? `Source URL context: ${sourceUrl}` : ''}
Topic: ${topic}
Content type: ${targetType}

Create a comprehensive, SEO-optimized post about this topic. Think deeply to ensure accuracy.
Use Google Search to find the latest and most accurate information.

Return a JSON object with these exact fields:
{
  "title": "Clear, SEO-friendly title (max 80 chars)",
  "type": "${targetType}",
  "category": "appropriate category",
  "organization": "organization name if applicable",
  "description": "Detailed HTML-formatted description with proper headings, bullet points. Min 300 words.",
  "startDate": "YYYY-MM-DD or empty string",
  "endDate": "YYYY-MM-DD or empty string",
  "officialUrl": "official website URL if known",
  "tags": ["tag1", "tag2", "tag3"],
  "thumbnailPrompt": "Detailed prompt for generating a thumbnail image",
  "featured": false,
  "isDraft": ${!autoPublishEnabled}
}`;

      const response = await ai.models.generateContent({
        model: THINKING_MODEL,
        contents: prompt,
        config: {
          ...HIGH_THINKING_CONFIG,
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
        }
      });

      const postData = JSON.parse(response.text?.trim() || '{}');
      logActivity('Content Generated', `Topic: "${topic}", Type: ${targetType}, Draft: ${postData.isDraft}`);
      res.json({ post: postData, autoPublishEnabled });
    } catch (error: any) {
      console.error('Generate post error:', error);
      logError('GeneratePostError', error.message);
      res.status(500).json({ error: error.message || 'Failed to generate post' });
    }
  });

  // ─────────────────────────────────────────────────────────
  // 🌐 F6: INTELLIGENCE — GOOGLE SEARCH TRENDING TOPICS
  // ─────────────────────────────────────────────────────────
  app.post('/api/intelligence/search-trends', async (req, res) => {
    try {
      const { niche = 'government jobs India', keywords = [] } = req.body;
      const ai = getAiClient();

      const prompt = `Search for the latest trending topics in "${niche}" category for an Indian education/government jobs portal.
Additional keywords to focus on: ${keywords.join(', ') || 'SSC, UPSC, Railway, Banking, State Government Jobs'}

Find the top 5 most recent and important updates from the last 48 hours.
For each topic return:
{
  "topics": [
    {
      "title": "Topic title",
      "summary": "2-3 sentence summary",
      "relevanceScore": 85,
      "contentType": "job|admit_card|result|scholarship",
      "searchQuery": "suggested search query for more info"
    }
  ]
}`;

      const cacheKey = `trends:${niche}:${keywords.join(',')}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      const response = await ai.models.generateContent({
        model: THINKING_MODEL,
        contents: prompt,
        config: {
          ...HIGH_THINKING_CONFIG,
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
        }
      });

      const result = JSON.parse(response.text?.trim() || '{"topics":[]}');
      setCache(cacheKey, result, 3600000); // 1 hour cache
      logActivity('Trend Search', `Niche: "${niche}", Found: ${result.topics?.length || 0} topics`);
      res.json(result);
    } catch (error: any) {
      console.error('Search trends error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ─────────────────────────────────────────────────────────
  // 🔗 F6: INTELLIGENCE — SOURCE MANAGEMENT
  // ─────────────────────────────────────────────────────────
  app.get('/api/intelligence/sources', (req, res) => {
    res.json({ sources: sourceURLs });
  });

  app.post('/api/intelligence/sources', (req, res) => {
    const { url, name } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const source: SourceURL = {
      id: `src_${Date.now()}`,
      url,
      name: name || url,
      addedAt: new Date().toISOString(),
    };
    sourceURLs.push(source);
    logActivity('Source Added', `URL: ${url}, Name: ${name}`);
    res.json({ source });
  });

  app.delete('/api/intelligence/sources/:id', (req, res) => {
    const { id } = req.params;
    const idx = sourceURLs.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Source not found' });
    sourceURLs.splice(idx, 1);
    res.json({ success: true });
  });

  // ─────────────────────────────────────────────────────────
  // 📋 F6: INTELLIGENCE — ACTIVITY LOG & SETTINGS
  // ─────────────────────────────────────────────────────────
  app.get('/api/intelligence/activity', (req, res) => {
    res.json({ logs: activityLogs.slice(0, 100) });
  });

  app.get('/api/intelligence/status', (req, res) => {
    res.json({
      autoPublishEnabled,
      sourcesCount: sourceURLs.length,
      activityCount: activityLogs.length,
      errorCount: errorLogs.length,
      lastActivity: activityLogs[0]?.timestamp || null,
    });
  });

  app.post('/api/intelligence/toggle-autopublish', (req, res) => {
    autoPublishEnabled = !autoPublishEnabled;
    logActivity('AutoPublish Toggled', `AutoPublish is now: ${autoPublishEnabled ? 'ON' : 'OFF'}`);
    res.json({ autoPublishEnabled });
  });

  // ─────────────────────────────────────────────────────────
  // 🚨 F6D: ERROR MONITORING ENDPOINTS
  // ─────────────────────────────────────────────────────────
  app.get('/api/errors', (req, res) => {
    res.json({ errors: errorLogs });
  });

  app.post('/api/errors/report', async (req, res) => {
    try {
      const { type, message, url, stack } = req.body;
      const entry = logError(type || 'ClientError', message || 'Unknown error', url, stack);
      res.json({ logged: true, id: entry.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/errors/:id', (req, res) => {
    const { id } = req.params;
    const idx = errorLogs.findIndex(e => e.id === id);
    if (idx !== -1) errorLogs.splice(idx, 1);
    res.json({ success: true });
  });

  // ─────────────────────────────────────────────────────────
  // 🧠 F6C: QUIZ IMPROVEMENT AI
  // ─────────────────────────────────────────────────────────
  app.post('/api/gemini/improve-quiz', async (req, res) => {
    try {
      const { quizData, performanceData } = req.body;
      const ai = getAiClient();

      const prompt = `You are an expert educational content analyst. Analyze this quiz and suggest improvements.

Quiz Data: ${JSON.stringify(quizData)}
Performance Data: ${JSON.stringify(performanceData || {})}

Analyze deeply and return JSON:
{
  "overallScore": 75,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1"],
  "improvedQuestions": [
    {
      "originalIndex": 0,
      "issue": "description of issue",
      "improvedQuestion": "better question text",
      "improvedOptions": ["opt1", "opt2", "opt3", "opt4"],
      "correctIndex": 0,
      "improvedExplanation": "clearer explanation"
    }
  ],
  "suggestedNewQuestions": [
    {
      "question": "new question",
      "options": ["a", "b", "c", "d"],
      "correctIndex": 0,
      "explanation": "why"
    }
  ],
  "difficultyBalance": {"easy": 30, "medium": 50, "hard": 20},
  "recommendations": ["recommendation1", "recommendation2"]
}`;

      const response = await ai.models.generateContent({
        model: THINKING_MODEL,
        contents: prompt,
        config: {
          ...HIGH_THINKING_CONFIG,
          responseMimeType: 'application/json',
        }
      });

      const result = JSON.parse(response.text?.trim() || '{}');
      logActivity('Quiz Improved', `Quiz analyzed, ${result.improvedQuestions?.length || 0} questions improved`);
      res.json(result);
    } catch (error: any) {
      console.error('Quiz improve error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ─────────────────────────────────────────────────────────
  // 🔍 HEALTH CHECK
  // ─────────────────────────────────────────────────────────
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      features: {
        highThinking: true,
        streaming: true,
        imageAnalysis: true,
        aspectRatioThumbnails: true,
        adminChatbot: true,
        autonomousIntelligence: true,
        errorMonitoring: true,
      },
      cache: { entries: responseCache.size },
      intelligence: {
        autoPublish: autoPublishEnabled,
        sources: sourceURLs.length,
        errors: errorLogs.length,
      }
    });
  });

  // ─────────────────────────────────────────────────────────
  // ⚡ VITE DEV MIDDLEWARE / PRODUCTION STATIC
  // ─────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`✅ High Thinking Mode: ENABLED (budget: 8192 tokens)`);
    console.log(`✅ Streaming: ENABLED`);
    console.log(`✅ Image Analysis: ENABLED`);
    console.log(`✅ Aspect-Ratio Thumbnails: ENABLED`);
    console.log(`✅ Admin AI Chatbot: ENABLED`);
    console.log(`✅ Autonomous Intelligence: ENABLED`);
    console.log(`✅ Health & Diagnostics: ENABLED`);
    console.log(`✅ Response Cache: ENABLED (1hr TTL)\n`);
  });
}

startServer().catch(err => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
