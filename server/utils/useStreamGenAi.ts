import { GoogleGenerativeAI } from '@google/generative-ai';

export async function* useStreamGenAi(prompt: string) {
    const config = useRuntimeConfig();
    const genAI = new GoogleGenerativeAI(config.private.googleAIStudioApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
    }
}
