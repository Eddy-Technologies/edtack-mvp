import { sendStream } from 'h3';
import { Readable } from 'stream'; // Import Readable from Node.js stream module
import { useStreamGenAi } from '../utils/useStreamGenAi.js'; // Assuming this path is correct

export default defineEventHandler(async (event) => {
  const { messages } = await readBody(event);
  if (!messages?.length) {
    throw createError({ statusCode: 400, message: 'Messages required' });
  }

  const prompt = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n') + '\nAssistant:';

  // Create a Node.js Readable stream from the async generator
  const readableStream = new Readable({
    async read() {
      // This function is called when the stream wants more data
    }
  });

  // Start consuming the async generator and push data to the readable stream
  await (async () => {
    try {
      for await (const chunk of useStreamGenAi(prompt)) {
        readableStream.push(chunk); // Push the generated text chunk to the stream
      }
      readableStream.push(null); // Signal the end of the stream
    } catch (error) {
      readableStream.destroy(error); // Signal an error in the stream
      console.error('Error in stream generation:', error);
    }
  })();

  return sendStream(event, readableStream);
});
