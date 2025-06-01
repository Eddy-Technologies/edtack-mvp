import { useBufferedGenAi } from '../utils/useBufferedGenAi';

export default defineEventHandler(async (event) => {
  const { messages, question } = await readBody(event);

  // Include the question as system context or preamble
  const userInput = messages[messages.length - 1]?.content || '';
  const prompt = question ? `${question} + ${userInput}` : userInput;

  const message = await useBufferedGenAi(prompt);
  return { message };
});
