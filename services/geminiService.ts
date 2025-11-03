
import { GoogleGenAI } from "@google/genai";

// Lazily initialize the GoogleGenAI client to prevent startup crashes
// in environments where process.env might not be immediately available.
let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI {
    if (!ai) {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("Gemini API key is not configured.");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
}

export const runAIPrompt = async (prompt: string, transcriptText: string): Promise<string> => {
    const fullPrompt = `${prompt}\n\nHere is the transcript:\n---\n${transcriptText}`;
    
    try {
        const aiInstance = getAiInstance();
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get response from Gemini API: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
};
