export default defineEventHandler(async (event) => {
  const { messages } = await readBody(event);

  // Sanity check: require at least one user message
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUserMsg?.content) return { message: 'No user input found' };

  // Preprocess messages for Gemini
  const geminiMessages = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : m.role,
    content: m.content,
  }));

  // Generate assistant reply (assuming it includes tokenCount in the return)
  const reply = await useBufferedGenAi(geminiMessages);
  console.log(reply);
  return reply;
});
