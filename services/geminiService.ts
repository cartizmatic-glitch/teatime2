import { GoogleGenAI } from "@google/genai";

// Use process.env.API_KEY as per guidelines. 
// Note: This relies on vite.config.ts 'define' to replace process.env.API_KEY with the actual key at build time.
// @ts-ignore
const apiKey = process.env.API_KEY || '';

// Initialize strictly if key exists, otherwise we handle errors gracefully in components
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateLetter = async (): Promise<string> => {
  // Fallback letters if API fails or is missing
  const persianAlphabet = 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی';
  
  if (!ai) {
    return persianAlphabet[Math.floor(Math.random() * persianAlphabet.length)];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Generate a single random Persian letter (Farsi alphabet) for the game Esm-o-Famil. Only return the character, nothing else.',
    });
    const text = response.text?.trim();
    return text && text.length === 1 ? text : persianAlphabet[Math.floor(Math.random() * persianAlphabet.length)];
  } catch (error) {
    console.error("Gemini Error:", error);
    return persianAlphabet[Math.floor(Math.random() * persianAlphabet.length)];
  }
};

export const validateWords = async (letter: string, category: string, word: string): Promise<boolean> => {
  if (!word || word.length < 2) return false;
  if (!word.startsWith(letter)) return false; // Basic local check

  if (!ai) return true; // Loose validation if no AI

  try {
    const prompt = `
      Check if the word "${word}" is a valid "${category}" in Persian (Farsi) that starts with the letter "${letter}".
      Answer strictly "TRUE" or "FALSE".
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const result = response.text?.trim().toUpperCase();
    return result?.includes("TRUE") ?? false;
  } catch (e) {
    return true; // Fallback to allow play
  }
};