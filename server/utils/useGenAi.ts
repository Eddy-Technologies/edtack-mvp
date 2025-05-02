import {GoogleGenerativeAI} from '@google/generative-ai'

export const useGenAi = async (schema) => {
    const config = useRuntimeConfig()
    const genAI = new GoogleGenerativeAI(config.private.googleAIStudioApiKey);
    return genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0,
            topK: 30,
            topP: 0.75
        },
    });
}
