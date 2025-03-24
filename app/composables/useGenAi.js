import {GoogleGenerativeAI} from '@google/generative-ai'

export const useGenAi = async (schema) => {
    const VITE_GOOGLE_AI_STUDIO_API_KEY = "AIzaSyBottpu2Q1606SXtA1gv3USpgX2RHsQObQ";

    const genAI = new GoogleGenerativeAI(VITE_GOOGLE_AI_STUDIO_API_KEY)
    return genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0,
            topK: 30,
            topP: 0.75
        },
    });
}
