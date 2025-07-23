// In-memory summary, replace with DB/persistent store in prod
let conversationSummary =
  'Eddy is a lion character that talks and is highly intelligent, he educates with passion.';

export default defineEventHandler(async (event) => {
  const { messages } = await readBody(event);

  // Sanity check: require at least one user message
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUserMsg?.content) return { message: 'No user input found' };

  // Keep only recent N messages for context
  const MAX_CONTEXT_MESSAGES = 6;
  const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);

  // Prepend system prompt with current summary
  const geminiMessages = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : m.role,
    content: m.content,
  }));

  // Generate assistant reply
  const reply = await useBufferedGenAi(geminiMessages);

  // Prepare summary update prompt
  const summaryPrompt = [
    {
      role: 'system',
      content:
        'You are a helpful assistant. Summarize the conversation context briefly and clearly.',
    },
    {
      role: 'user',
      content: `Current summary:\n${conversationSummary}\n\nConversation:\n${messages
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n')}\n\nPlease provide a short updated summary:`,
    },
  ];

  // Generate updated summary
  const updatedSummary = await useBufferedGenAi(summaryPrompt);

  // Update global summary
  if (updatedSummary && updatedSummary.trim().length > 0) {
    conversationSummary = updatedSummary.trim();
  }

  return { message: reply, updatedSummary: conversationSummary };
});
