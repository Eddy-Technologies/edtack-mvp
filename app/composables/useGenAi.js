import {GoogleGenerativeAI} from '@google/generative-ai'

export const useGenAi = async (modelType, schema) => {
    const VITE_GOOGLE_AI_STUDIO_API_KEY = process.env.VITE_GOOGLE_AI_STUDIO_API_KEY;

    const genAI = new GoogleGenerativeAI(VITE_GOOGLE_AI_STUDIO_API_KEY)
    return genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });
}
