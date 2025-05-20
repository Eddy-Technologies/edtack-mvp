import { GoogleGenerativeAI } from '@google/generative-ai';

export async function useBufferedGenAi(prompt: string): Promise<string> {
    const config = useRuntimeConfig();
    const genAI = new GoogleGenerativeAI(config.private.googleAIStudioApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContentStream(prompt);

    let fullText = '';
    for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) fullText += text;
    }

    return fullText;
}
