/**
 * Message API utility for saving messages to DB from Pinia store.
 *
 * This is a standalone utility (not a composable) to avoid circular dependencies
 * when the messageQueue store needs to persist AI responses to the database.
 */

export interface SaveMessageParams {
  thread_id: string;
  content: any;
  type: 'text' | 'json';
  isUser: boolean;
  uuid: string;
}

export interface SaveMessageResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Save a message to the database via the /api/chat/message endpoint.
 * Used by messageQueue store to persist AI responses even when ChatContent is unmounted.
 */
export async function saveMessageToDB(params: SaveMessageParams): Promise<SaveMessageResult> {
  try {
    const response = await $fetch<{ id: string }>('/api/chat/message', {
      method: 'POST',
      body: params,
    });
    console.log('[messageApi] Message saved successfully:', { id: response.id, thread_id: params.thread_id });
    return { success: true, id: response.id };
  } catch (error: any) {
    console.error('[messageApi] Failed to save message:', error);
    return {
      success: false,
      error: error.message || 'Failed to save message',
    };
  }
}

/**
 * Call the stop endpoint to stop RAG server-side processing.
 * Used to conserve tokens when errors occur.
 */
export async function stopRAGProcessing(pythonApiUrl: string, threadId: string, authToken?: string): Promise<boolean> {
  const stopUrl = `${pythonApiUrl}/api/v1/chat/${threadId}/stop`;

  try {
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(stopUrl, {
      method: 'POST',
      headers,
    });

    console.log('[messageApi] Stop RAG processing result:', response.ok);
    return response.ok;
  } catch (error) {
    console.error('[messageApi] Failed to stop RAG processing:', error);
    return false;
  }
}
