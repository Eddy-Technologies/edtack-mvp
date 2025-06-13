import { defineEventHandler, readBody, createError } from 'h3';
import { Buffer } from 'buffer';
import { GoogleGenAI } from '@google/genai';

export default defineEventHandler(async (event) => {
  const { text } = await readBody(event);

  if (!text || typeof text !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Text content (string) is required for speech synthesis.',
    });
  }

  try {
    const config = useRuntimeConfig();
    const genAI = new GoogleGenAI({ apiKey: config.private.googleAIStudioApiKey });

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: 'Say cheerfully: Have a wonderful day!' }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    console.log(base64Data.slice(0, 30));
    if (!base64Data) {
      throw createError({ statusCode: 500, message: 'No audio data received from AI model.' });
    }

    const audioBuffer = Buffer.from(base64Data, 'base64');

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.toString(),
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Error in Google TTS API call:', error);
    throw createError({ statusCode: 500, message: 'Failed to synthesize speech using AI model.' });
  }
});
