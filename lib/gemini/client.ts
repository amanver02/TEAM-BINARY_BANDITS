import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Returns the shared Gemini Flash model instance.
 * Only call from server-side code (Route Handlers, Server Actions).
 */
export function getGeminiModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.3,       // Lower temp → more factual, consistent outputs
      maxOutputTokens: 2048,
      responseMimeType: 'application/json', // Structured JSON responses
    } as any,
  });
}

/**
 * Helper: call Gemini and safely parse the JSON response.
 * Returns null on parse failure — callers must handle gracefully.
 */
export async function callGeminiJSON<T>(prompt: string): Promise<T | null> {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as T;
  } catch (err) {
    console.error('[Gemini] Error:', err);
    return null;
  }
}
