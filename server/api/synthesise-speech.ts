import { Buffer } from 'buffer';
import { defineEventHandler, readBody, createError, send } from 'h3';
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
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' },
          },
        },
      },
    });

    const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Data) {
      throw new Error('No audio data received from TTS model.');
    }

    const audioBuffer = Buffer.from(base64Data, 'base64');
    event.node.res.setHeader('Content-Type', 'audio/wav');
    event.node.res.setHeader('Content-Disposition', 'inline; filename="tts.wav"');
    return send(event, audioBuffer);
  } catch (error) {
    console.error('TTS error:', error);
    throw createError({ statusCode: 500, message: 'TTS synthesis failed.' });
  }
});
