import { defineEventHandler, readBody, createError } from 'h3';
import { GoogleGenAI } from '@google/genai';

export default defineEventHandler(async (event) => {
  const { text } = await readBody(event);

  if (!text || typeof text !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Text content is required.',
    });
  }

  try {
    const config = useRuntimeConfig();
    const genAI = new GoogleGenAI({ apiKey: config.private.googleAIStudioApiKey });

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
    });

    const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (!inlineData?.data || !inlineData?.mimeType) {
      throw new Error('No audio data or mime type received.');
    }

    const audioBuffer = Buffer.from(inlineData.data, 'base64');

    // Save to Nitro storage
    const filename = `speech.wav`;
    await useStorage('assets:public').setItemRaw(filename, audioBuffer);

    return {
      success: true,
      path: `/public/${filename}`, // for downloading from client
      filename,
    };
  } catch (error) {
    console.error('TTS error:', error);
    throw createError({ statusCode: 500, message: 'TTS synthesis failed.' });
  }
});
