import { ref, onUnmounted } from 'vue';
import type { ChatResponse, ChatOptions, ChatUserInfo } from './chat.types';

export type UseSSEChatOptions = ChatOptions;

/**
 * SSE-based chat composable for streaming chat responses
 * Alternative to WebSocket for one-way streaming from server
 */
export function useSSEChat(threadId: string, options: UseSSEChatOptions = {}) {
  const config = useRuntimeConfig();
  const isConnected = ref(false);
  const isConnecting = ref(false); // SSE doesn't have a connecting phase, always false
  const isStreaming = ref(false);
  const response = ref<ChatResponse[]>([]);
  const error = ref<string | null>(null);
  const isWaitingForResponse = ref(false);
  const responsePhase = ref<string>('');

  let currentAuthToken = options.authToken;
  let abortController: AbortController | null = null;

  const setAuthToken = (token: string) => {
    currentAuthToken = token;
  };

  const buildHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    };

    if (currentAuthToken && config.public.chatAuthEnabled) {
      headers['Authorization'] = `Bearer ${currentAuthToken}`;
    }

    return headers;
  };

  /**
   * Parse SSE data from a chunk of text
   */
  const parseSSEChunk = (chunk: string): { eventType: string; data: any }[] => {
    const events: { eventType: string; data: any }[] = [];
    const lines = chunk.split('\n');

    let currentEventType = '';
    let currentData = '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEventType = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        currentData = line.slice(6);

        if (currentEventType && currentData) {
          try {
            const parsedData = JSON.parse(currentData);
            events.push({ eventType: currentEventType, data: parsedData });
          } catch {
            // If JSON parse fails, treat as string data
            events.push({ eventType: currentEventType, data: currentData });
          }
          currentEventType = '';
          currentData = '';
        }
      } else if (line === '' && currentData) {
        // Empty line signals end of event
        currentEventType = '';
        currentData = '';
      }
    }

    return events;
  };

  /**
   * Handle parsed SSE events
   */
  const handleSSEEvent = (eventType: string, data: any) => {
    // Handle heartbeat - don't add to messages
    if (eventType === 'heartbeat') {
      return;
    }

    // Handle status updates
    if (eventType === 'status') {
      if (data.status) {
        responsePhase.value = data.status;
      }

      // Convert to response format compatible with WebSocket handler
      const responseData: ChatResponse = {
        status: 'status_update',
        phase: data.status,
        generation_intent_type: data.generation_intent_type,
        timestamp: data.timestamp,
      };
      response.value.push(responseData);
      return;
    }

    // Handle slide batches - convert to WebSocket-compatible format
    if (eventType === 'slide_batch_ready') {
      const responseData: ChatResponse = {
        type: 'slide_batch_ready',
        status: 'streaming',
        batch: {
          slides: data.slides || [],
          batch_size: data.slides?.length || 0,
          total_slides_so_far: data.batch_index !== undefined ?
              (data.batch_index + 1) * (data.slides?.length || 0) :
            data.slides?.length || 0,
        },
      };
      response.value.push(responseData);
      return;
    }

    // Handle quiz batches
    if (eventType === 'quiz_batch_ready') {
      const responseData: ChatResponse = {
        type: 'slide_batch_ready', // Use same type for compatibility
        status: 'streaming',
        batch: {
          slides: data.quiz_items || [],
          batch_size: data.quiz_items?.length || 0,
          total_slides_so_far: data.batch_index !== undefined ?
              (data.batch_index + 1) * (data.quiz_items?.length || 0) :
            data.quiz_items?.length || 0,
        },
      };
      response.value.push(responseData);
      return;
    }

    // Handle user messages
    if (eventType === 'user_message') {
      const responseData: ChatResponse = {
        status: 'user_message',
        message: data.message,
        timestamp: data.timestamp,
      };
      response.value.push(responseData);
      return;
    }

    // Handle completion
    if (eventType === 'completed') {
      isWaitingForResponse.value = false;
      isStreaming.value = false;
      responsePhase.value = '';

      const responseData: ChatResponse = {
        status: 'completed',
        timestamp: data.timestamp,
      };
      response.value.push(responseData);
      return;
    }

    // Handle cancellation
    if (eventType === 'cancelled') {
      isWaitingForResponse.value = false;
      isStreaming.value = false;
      responsePhase.value = '';

      const responseData: ChatResponse = {
        status: 'cancelled',
        timestamp: data.timestamp,
      };
      response.value.push(responseData);
      return;
    }

    // Handle errors
    if (eventType === 'error') {
      isWaitingForResponse.value = false;
      isStreaming.value = false;
      error.value = data.message || 'Unknown error occurred';

      const responseData: ChatResponse = {
        status: 'error',
        error: data.message,
        timestamp: data.timestamp,
      };
      response.value.push(responseData);
      return;
    }

    // Handle node_output (raw graph outputs) - pass through
    if (eventType === 'node_output') {
      const responseData: ChatResponse = {
        status: 'node_output',
        data: data,
        timestamp: data.timestamp,
      };
      response.value.push(responseData);
      return;
    }
  };

  /**
   * Start a streaming chat session
   */
  const startChat = async (
    initialMessage: string,
    userInfo?: ChatUserInfo
  ): Promise<boolean> => {
    if (isStreaming.value) {
      console.warn('Already streaming');
      return false;
    }

    error.value = null;
    isWaitingForResponse.value = true;
    isStreaming.value = true;
    isConnected.value = true;

    // Create new abort controller for this request
    abortController = new AbortController();

    const apiUrl = `${config.public.pythonApiUrl}/api/v1/chat/${threadId}`;

    try {
      const fetchResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
          input: initialMessage,
          user_info: userInfo,
        }),
        signal: abortController.signal,
      });

      if (fetchResponse.status === 401) {
        error.value = 'Authentication failed';
        isWaitingForResponse.value = false;
        isStreaming.value = false;
        return false;
      }

      if (!fetchResponse.ok) {
        error.value = `HTTP error: ${fetchResponse.status}`;
        isWaitingForResponse.value = false;
        isStreaming.value = false;
        return false;
      }

      if (!fetchResponse.body) {
        error.value = 'No response body';
        isWaitingForResponse.value = false;
        isStreaming.value = false;
        return false;
      }

      // Read the stream
      const reader = fetchResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          isStreaming.value = false;
          isWaitingForResponse.value = false;
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Parse complete events from buffer
        const events = parseSSEChunk(buffer);

        for (const event of events) {
          handleSSEEvent(event.eventType, event.data);
        }

        // Keep incomplete data in buffer
        const lastNewline = buffer.lastIndexOf('\n\n');
        if (lastNewline !== -1) {
          buffer = buffer.slice(lastNewline + 2);
        }
      }

      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was cancelled
        const responseData: ChatResponse = {
          status: 'cancelled',
          timestamp: Date.now(),
        };
        response.value.push(responseData);
      } else {
        error.value = err.message || 'Failed to start chat';
        const responseData: ChatResponse = {
          status: 'error',
          error: err.message,
        };
        response.value.push(responseData);
      }

      isWaitingForResponse.value = false;
      isStreaming.value = false;
      return false;
    }
  };

  /**
   * Send a user response (continues the conversation)
   * For SSE, this starts a new POST request
   */
  const sendUserResponse = async (
    message: string,
    userInfo?: ChatUserInfo
  ): Promise<boolean> => {
    // SSE uses same endpoint for continuation
    return startChat(message, userInfo);
  };

  /**
   * Cancel the current streaming request
   */
  const cancelRequest = async (): Promise<boolean> => {
    // Abort the fetch request
    if (abortController) {
      abortController.abort();
      abortController = null;
    }

    // Also call the stop endpoint to stop server-side processing
    const stopUrl = `${config.public.pythonApiUrl}/api/v1/chat/${threadId}/stop`;

    try {
      const stopResponse = await fetch(stopUrl, {
        method: 'POST',
        headers: buildHeaders(),
      });

      responsePhase.value = '';
      isWaitingForResponse.value = false;
      isStreaming.value = false;

      return stopResponse.ok;
    } catch {
      responsePhase.value = '';
      isWaitingForResponse.value = false;
      isStreaming.value = false;
      return false;
    }
  };

  /**
   * Get chat status
   */
  const getStatus = async (): Promise<{ status: string; is_cancelled: boolean } | null> => {
    const statusUrl = `${config.public.pythonApiUrl}/api/v1/chat/${threadId}/status`;

    try {
      const statusResponse = await fetch(statusUrl, {
        method: 'GET',
        headers: buildHeaders(),
      });

      if (statusResponse.ok) {
        return await statusResponse.json();
      }
      return null;
    } catch {
      return null;
    }
  };

  const clearMessages = () => {
    response.value = [];
  };

  const disconnect = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    isConnected.value = false;
    isStreaming.value = false;
    isWaitingForResponse.value = false;
  };

  // SSE doesn't need explicit connect - connection happens on startChat
  const connect = (token?: string) => {
    if (token) {
      currentAuthToken = token;
    }
    isConnected.value = true;
  };

  // For compatibility with WebSocket interface
  const waitForConnection = (_timeout: number = 5000): Promise<void> => {
    // SSE is "connected" immediately since it uses fetch
    isConnected.value = true;
    return Promise.resolve();
  };

  // continueChat is same as sendUserResponse for SSE
  const continueChat = () => {
    // For SSE, continue is not applicable in the same way as WebSocket
    // The chat continues via sendUserResponse
    return true;
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    connect,
    disconnect,
    setAuthToken,
    waitForConnection,
    startChat,
    continueChat,
    sendUserResponse,
    cancelRequest,
    clearMessages,
    getStatus,
    response,
    isConnected,
    isConnecting,
    isStreaming,
    isWaitingForResponse,
    error,
    responsePhase,
  };
}
