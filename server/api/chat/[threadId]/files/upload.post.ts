/**
 * File Upload Endpoint
 *
 * POST /api/chat/[threadId]/files/upload
 *
 * Proxies file uploads to the Python backend.
 * Files are staged and automatically attached to the next chat message.
 *
 * Request: multipart/form-data with files
 * Response: { file_ids, file_count, total_size_bytes, files }
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
    // Parse multipart form data
    const formData = await readMultipartFormData(event);

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No files provided',
      });
    }

    console.log(`[File Upload] Uploading ${formData.length} files to thread ${threadId}`);

    // Create FormData for Python backend
    const proxyFormData = new FormData();

    for (const part of formData) {
      if (part.filename && part.data) {
        // Create a Blob from the buffer
        const blob = new Blob([part.data], { type: part.type || 'application/octet-stream' });
        proxyFormData.append('files', blob, part.filename);
      }
    }

    // Forward to Python backend
    const pythonUrl = `${pythonApiUrl}/api/v1/files/${threadId}/upload`;

    const headers: Record<string, string> = {};
    if (token && config.public.chatAuthEnabled) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(pythonUrl, {
      method: 'POST',
      headers,
      body: proxyFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[File Upload] Python backend error:`, response.status, errorText);
      throw createError({
        statusCode: response.status,
        message: `Upload failed: ${errorText}`,
      });
    }

    const result = await response.json();
    console.log(`[File Upload] Successfully uploaded ${result.file_count} files`);

    return result;
  } catch (err: any) {
    console.error(`[File Upload] Error:`, err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      message: err.message || 'Failed to upload files',
    });
  }
});
