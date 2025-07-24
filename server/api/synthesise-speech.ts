import { Buffer } from 'buffer';
import { writeFile } from 'fs/promises';
import path from 'path';
import { defineEventHandler, readBody, createError } from 'h3';
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

    // ✅ Save the file to the server's /public/tts/ directory
    const filename = `speech.wav`;
    const filePath = path.resolve('public', filename);
    await writeFile(filePath, audioBuffer);

    // ✅ Respond with success and file path (for client download link)
    return {
      success: true,
      path: `/public/${filename}`, // relative public path
      filename,
    };
  } catch (error) {
    console.error('TTS error:', error);
    throw createError({ statusCode: 500, message: 'TTS synthesis failed.' });
  }
});
