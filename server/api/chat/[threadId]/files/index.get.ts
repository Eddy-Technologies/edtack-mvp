/**
 * List Staged Files Endpoint
 *
 * GET /api/chat/[threadId]/files
 *
 * Returns list of files currently staged for the thread.
 * Staged files are automatically attached to the next chat message.
 *
 * Response: { thread_id, files: [...] }
 */

export default defineEventHandler(async (event) => {
  const threadId = getRouterParam(event, 'threadId');

  if (!threadId) {
    throw createError({
      statusCode: 400,
      message: 'Thread ID is required',
    });
  }

  // Get auth token from header
  const authHeader = getHeader(event, 'authorization');
  const token = authHeader?.replace('Bearer ', '') || '';

  // Get runtime config for Python API URL
  const config = useRuntimeConfig();
  const pythonApiUrl = config.public.pythonApiUrl;

  try {
    const pythonUrl = `${pythonApiUrl}/api/v1/files/${threadId}`;

    const headers: Record<string, string> = {};
    if (token && config.public.chatAuthEnabled) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(pythonUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[List Files] Python backend error:`, response.status, errorText);
      throw createError({
        statusCode: response.status,
        message: `Failed to list files: ${errorText}`,
      });
    }

    return await response.json();
  } catch (err: any) {
    console.error(`[List Files] Error:`, err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      message: err.message || 'Failed to list files',
    });
  }
});
