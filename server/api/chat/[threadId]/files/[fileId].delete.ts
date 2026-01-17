/**
 * Delete Staged File Endpoint
 *
 * DELETE /api/chat/[threadId]/files/[fileId]
 *
 * Removes a specific file from the staging area.
 *
 * Response: { message, file_id }
 */

export default defineEventHandler(async (event) => {
  const threadId = getRouterParam(event, 'threadId');
  const fileId = getRouterParam(event, 'fileId');

  if (!threadId) {
    throw createError({
      statusCode: 400,
      message: 'Thread ID is required',
    });
  }

  if (!fileId) {
    throw createError({
      statusCode: 400,
      message: 'File ID is required',
    });
  }

  // Get auth token from header
  const authHeader = getHeader(event, 'authorization');
  const token = authHeader?.replace('Bearer ', '') || '';

  // Get runtime config for Python API URL
  const config = useRuntimeConfig();
  const pythonApiUrl = config.public.pythonApiUrl;

  try {
    const pythonUrl = `${pythonApiUrl}/api/v1/files/${threadId}/${fileId}`;

    const headers: Record<string, string> = {};
    if (token && config.public.chatAuthEnabled) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(pythonUrl, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Delete File] Python backend error:`, response.status, errorText);
      throw createError({
        statusCode: response.status,
        message: `Failed to delete file: ${errorText}`,
      });
    }

    console.log(`[Delete File] Deleted file ${fileId} from thread ${threadId}`);
    return await response.json();
  } catch (err: any) {
    console.error(`[Delete File] Error:`, err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      message: err.message || 'Failed to delete file',
    });
  }
});
