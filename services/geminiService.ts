import { GoogleGenAI, Type } from "@google/genai";
import { BirdData, BirdAnalysis } from "../types";

// Assuming process.env.API_KEY is available
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeBird = async (bird: BirdData): Promise<BirdAnalysis> => {
  if (!API_KEY) {
    throw new Error("API Key missing");
  }

  const prompt = `
    I have a procedural bird in a simulation with the following traits:
    - Color Hex: ${bird.color}
    - Base Pitch Frequency: ${bird.pitch}Hz
    - Typical State: ${bird.state}
    - Size Scale: ${bird.scale.toFixed(2)}

    Creatively invent a fictional bird species based on these traits. 
    Provide a scientific name, a common name, a short behavioral description suitable for a nature guide, and its temperament.
    Make it sound scientific but whimsical.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            speciesName: { type: Type.STRING },
            scientificName: { type: Type.STRING },
            description: { type: Type.STRING },
            temperament: { type: Type.STRING },
          },
          required: ["speciesName", "scientificName", "description", "temperament"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as BirdAnalysis;
    }
    throw new Error("No text response");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
        speciesName: "Unknown Specimen",
        scientificName: "Avis Incognita",
        description: "The observer was unable to classify this bird due to atmospheric interference.",
        temperament: "Elusive"
    };
  }
};
