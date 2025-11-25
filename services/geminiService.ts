import { GoogleGenAI, Type } from "@google/genai";
import { Theme } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateThemeFromMood = async (mood: string): Promise<Theme> => {
  const ai = getAiClient();
  
  // Fallback theme if no API key or error
  const fallbackTheme: Theme = {
    name: "Serenity",
    colors: ["#60A5FA", "#34D399", "#818CF8", "#C084FC", "#F472B6"],
    speed: 1,
    flowType: 'calm',
    message: "Breathe in deeply... and let go."
  };

  if (!ai) {
    console.warn("No API Key found, using fallback.");
    return fallbackTheme;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `The user is feeling: "${mood}". Generate a visual relaxation theme for a particle simulation game based on this mood.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "A short, evocative title for this theme" },
            colors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "5 hex color codes that match the mood (e.g. cool blues for calm, warm oranges for energy)"
            },
            speed: { type: Type.NUMBER, description: "Simulation speed multiplier between 0.5 (slow/sad) and 2.0 (manic/happy)" },
            flowType: { 
              type: Type.STRING, 
              enum: ["calm", "energetic", "focused", "dreamy"],
              description: "The behavior pattern of the particles"
            },
            message: { type: Type.STRING, description: "A short, soothing, philosophical, or encouraging quote based on the mood." }
          },
          required: ["name", "colors", "speed", "flowType", "message"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return fallbackTheme;
    
    return JSON.parse(jsonText) as Theme;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return fallbackTheme;
  }
};