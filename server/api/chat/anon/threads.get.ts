/**
 * Get Anonymous User Threads
 *
 * GET /api/chat/anon/threads
 *
 * Returns empty array for anonymous users - chat history is not displayed
 * to anonymous users. Messages are still stored in DB for conversion on signup.
 */

export default defineEventHandler(async () => {
  // Anonymous users don't see thread history - return empty array
  // Messages are stored in DB and will be available after signup/login
  return { success: true, data: [] };
});
