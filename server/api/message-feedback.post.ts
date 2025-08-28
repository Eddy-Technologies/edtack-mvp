// server/api/message-feedback.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  console.log('=== MESSAGE FEEDBACK RECEIVED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Feedback Data:', JSON.stringify(body, null, 2));
  console.log('================================');

  const {
    like,
    feedback,
    category,
    messageUuid,
    threadId,
    messageText,
    timestamp
  } = body;

  // Basic validation
  if (typeof like !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: "like" field is required and must be a boolean.',
    });
  }

  // Simulate database operation
  const mockFeedbackRecord = {
    id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    like: like,
    feedback: feedback || null,
    category: category || null,
    messageUuid: messageUuid,
    threadId: threadId || null,
    messageText: messageText?.substring(0, 100) + '...', // Truncated for logging
    userId: 'mock_user_id', // Would come from auth in real implementation
    createdAt: timestamp || new Date().toISOString(),
  };

  // Mock success response
  return {
    success: true,
    message: 'Feedback received successfully',
    data: mockFeedbackRecord
  };
});
