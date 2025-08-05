import {GoogleGenerativeAI} from '@google/generative-ai';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function useBufferedGenAi(messages: Message[]): Promise<any> {
  const config = useRuntimeConfig();
  const genAI = new GoogleGenerativeAI(config.private.googleAIStudioApiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });

  // Transform to Gemini's expected format
  const contents = messages.map((msg) => {
    const role = msg.role === 'assistant' ? 'model' : msg.role === 'system' ? 'user' : msg.role;

    const text = msg.role === 'system' ? `System Instruction:\n${msg.content}` : msg.content;

    return {
      role,
      parts: [{ text }],
    };
  });

  try {
    return await model.generateContent({contents});
  } catch (error: any) {
    console.error('Error in useBufferedGenAi:', error?.message || error);
    return '[Error generating response]';
  }
}
