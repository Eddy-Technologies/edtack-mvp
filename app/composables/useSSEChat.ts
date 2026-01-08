import { ref, onUnmounted, getCurrentInstance } from 'vue';
import type { ChatResponse, ChatOptions, ChatUserInfo } from './chat.types';
import { getSupabaseAccessToken } from '~/utils/authToken';

export interface UseSSEChatOptions extends ChatOptions {
  /**
   * If true (default), automatically disconnect when the component unmounts.
   * Set to false when using in a Pinia store to prevent lifecycle interference.
   */
  autoCleanup?: boolean;
  /**
   * Direct callback for terminal events (completed, cancelled, error, timeout).
   * Bypasses the unreliable watcher chain for more reliable end-state detection.
   */
  onTerminalEvent?: (status: string, response: ChatResponse) => void;
}

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
  let hasReceivedTerminalEvent = false; // Track if we've received a terminal event (completed, error, cancelled)
  const onTerminalEvent = options.onTerminalEvent; // Direct callback for terminal events

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
   * Parse SSE data from a chunk of text.
   * SSE format: event: <type>\ndata: <json>\n\n
   */
  const parseSSEChunk = (chunk: string): { eventType: string; data: any }[] => {
    const events: { eventType: string; data: any }[] = [];

    // Split by double newlines to get complete events
    const eventBlocks = chunk.split('\n\n');

    for (const block of eventBlocks) {
      if (!block.trim()) continue;

      const lines = block.split('\n');
      let eventType = '';
      const dataLines: string[] = [];

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          dataLines.push(line.slice(6));
        } else if (line.startsWith('data:')) {
          // Handle "data:" without space
          dataLines.push(line.slice(5));
        }
      }

      // Combine multi-line data and parse
      if (eventType && dataLines.length > 0) {
        const rawData = dataLines.join('\n');
        try {
          const parsedData = JSON.parse(rawData);
          events.push({ eventType, data: parsedData });
        } catch {
          // If JSON parse fails, treat as string data
          events.push({ eventType, data: rawData });
        }
      }
    }

    return events;
  };

  /**
   * Handle parsed SSE events
   */
  const handleSSEEvent = (eventType: string, data: any) => {
    console.log('[SSEChat] handleSSEEvent:', eventType, 'response.length before:', response.value.length);

    // Handle heartbeat - don't add to messages
    if (eventType === 'heartbeat') {
      return;
    }

    // Handle slide generation start - signals beginning of new slide session
    if (eventType === 'slide_generation_start') {
      const responseData: ChatResponse = {
        type: 'slide_generation_start',
        timestamp: data.timestamp,
      };
      response.value.push(responseData);
      console.log('[SSEChat] Pushed slide_generation_start');
      return;
    }

    // Handle slide generation complete - signals end of slide session
    if (eventType === 'slide_generation_complete') {
      const responseData: ChatResponse = {
        type: 'slide_generation_complete',
        timestamp: data.timestamp,
      };
      response.value.push(responseData);
      console.log('[SSEChat] Pushed slide_generation_complete');
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
      console.log('[SSEChat] Pushed status_update, response.length:', response.value.length);
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
      hasReceivedTerminalEvent = true;
      isWaitingForResponse.value = false;
      isStreaming.value = false;
      responsePhase.value = '';

      const responseData: ChatResponse = {
        status: 'completed',
        timestamp: data.timestamp,
      };
      console.log('[SSEChat] Pushing terminal event: completed, response.length before:', response.value.length);
      response.value.push(responseData);
      console.log('[SSEChat] Terminal event pushed, response.length after:', response.value.length);

      // DIRECT CALLBACK: Notify store immediately, bypassing unreliable watcher chain
      if (onTerminalEvent) {
        console.log('[SSEChat] Calling onTerminalEvent callback for: completed');
        onTerminalEvent('completed', responseData);
      }
      return;
    }

    // Handle cancellation
    if (eventType === 'cancelled') {
      hasReceivedTerminalEvent = true;
      isWaitingForResponse.value = false;
      isStreaming.value = false;
      responsePhase.value = '';

      const responseData: ChatResponse = {
        status: 'cancelled',
        timestamp: data.timestamp,
      };
      console.log('[SSEChat] Pushing terminal event: cancelled, response.length before:', response.value.length);
      response.value.push(responseData);
      console.log('[SSEChat] Terminal event pushed, response.length after:', response.value.length);

      // DIRECT CALLBACK: Notify store immediately, bypassing unreliable watcher chain
      if (onTerminalEvent) {
        console.log('[SSEChat] Calling onTerminalEvent callback for: cancelled');
        onTerminalEvent('cancelled', responseData);
      }
      return;
    }

    // Handle errors
    if (eventType === 'error') {
      hasReceivedTerminalEvent = true;
      isWaitingForResponse.value = false;
      isStreaming.value = false;
      error.value = data.message || 'Unknown error occurred';

      const responseData: ChatResponse = {
        status: 'error',
        error: data.message,
        timestamp: data.timestamp,
      };
      console.log('[SSEChat] Pushing terminal event: error, response.length before:', response.value.length);
      response.value.push(responseData);
      console.log('[SSEChat] Terminal event pushed, response.length after:', response.value.length);

      // DIRECT CALLBACK: Notify store immediately, bypassing unreliable watcher chain
      if (onTerminalEvent) {
        console.log('[SSEChat] Calling onTerminalEvent callback for: error');
        onTerminalEvent('error', responseData);
      }
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
   * Internal implementation of startChat with retry support
   */
  const startChatInternal = async (
    initialMessage: string,
    userInfo?: ChatUserInfo,
    isRetry: boolean = false
  ): Promise<boolean> => {
    if (isStreaming.value && !isRetry) {
      console.warn('Already streaming');
      return false;
    }

    error.value = null;
    isWaitingForResponse.value = true;
    isStreaming.value = true;
    isConnected.value = true;
    hasReceivedTerminalEvent = false; // Reset for new request

    // Create new abort controller for this request
    abortController = new AbortController();

    const apiUrl = `${config.public.pythonApiUrl}/api/v1/chat/${threadId}`;
    const INITIAL_TIMEOUT_MS = 30 * 1000; // 30 seconds for initial connection

    try {
      // Set up initial connection timeout
      const timeoutId = setTimeout(() => {
        if (abortController) {
          console.warn('[SSEChat] Initial connection timeout after', INITIAL_TIMEOUT_MS / 1000, 'seconds');
          abortController.abort();
        }
      }, INITIAL_TIMEOUT_MS);

      let fetchResponse: Response;
      try {
        fetchResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: buildHeaders(),
          body: JSON.stringify({
            input: initialMessage,
            user_info: userInfo,
          }),
          signal: abortController.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      // Handle 401 Unauthorized - could be expired token, try refresh first
      if (fetchResponse.status === 401) {
        if (!isRetry && config.public.chatAuthEnabled) {
          console.log('[SSEChat] 401 Unauthorized - token may be expired, attempting refresh');
          const freshToken = await getSupabaseAccessToken();
          if (freshToken) {
            currentAuthToken = freshToken;
            // Retry with fresh token
            return startChatInternal(initialMessage, userInfo, true);
          }
        }
        // Refresh failed or already retried - user needs to login
        console.log('[SSEChat] 401 - refresh failed, user needs to login');
        error.value = 'Please log in to continue';
        isWaitingForResponse.value = false;
        isStreaming.value = false;
        return false;
      }

      // Handle 403 Forbidden - permission denied (not an auth issue)
      if (fetchResponse.status === 403) {
        console.log('[SSEChat] 403 Forbidden - permission denied');
        error.value = 'Access denied - you do not have permission';
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

      // Read the stream with timeout protection
      const reader = fetchResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let lastActivityTime = Date.now();
      const STREAM_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes without activity

      while (true) {
        // Check for stream timeout (no data received for too long)
        const timeSinceLastActivity = Date.now() - lastActivityTime;
        if (timeSinceLastActivity > STREAM_TIMEOUT_MS) {
          console.warn('[SSEChat] Stream timeout - no data received for', STREAM_TIMEOUT_MS / 1000, 'seconds');
          error.value = 'Stream timeout - no response from server';

          // Push timeout event so ChatContent.vue gets notified
          const timeoutResponse: ChatResponse = {
            status: 'timeout',
            error: 'Stream timeout - no response from server',
            timestamp: Date.now(),
          };
          response.value.push(timeoutResponse);

          // DIRECT CALLBACK: Notify store immediately
          if (onTerminalEvent) {
            console.log('[SSEChat] Calling onTerminalEvent callback for: timeout');
            onTerminalEvent('timeout', timeoutResponse);
          }

          isStreaming.value = false;
          isWaitingForResponse.value = false;
          break;
        }

        const { value, done } = await reader.read();

        if (done) {
          // Process any remaining data in the buffer before ending
          if (buffer.trim()) {
            console.log('[SSEChat] Processing remaining buffer on stream end:', buffer.substring(0, 100));
            const finalEvents = parseSSEChunk(buffer);
            for (const event of finalEvents) {
              handleSSEEvent(event.eventType, event.data);
            }
          }

          // If no terminal event was received (completed, error, cancelled),
          // push a synthetic 'completed' event so ChatContent.vue gets notified
          // This fixes the bug where ChatContent's isWaitingForResponse stays true
          if (!hasReceivedTerminalEvent) {
            console.log('[SSEChat] Stream ended without terminal event - pushing synthetic completed');
            const syntheticCompleted: ChatResponse = {
              status: 'completed',
              timestamp: Date.now(),
            };
            response.value.push(syntheticCompleted);

            // DIRECT CALLBACK: Notify store immediately
            if (onTerminalEvent) {
              console.log('[SSEChat] Calling onTerminalEvent callback for: synthetic completed');
              onTerminalEvent('completed', syntheticCompleted);
            }
          }

          isStreaming.value = false;
          isWaitingForResponse.value = false;
          break;
        }

        // Update activity timestamp
        lastActivityTime = Date.now();

        buffer += decoder.decode(value, { stream: true });

        // Parse complete events from buffer
        const events = parseSSEChunk(buffer);

        for (const event of events) {
          handleSSEEvent(event.eventType, event.data);
        }

        // Keep incomplete data in buffer (data after last double newline)
        const lastNewline = buffer.lastIndexOf('\n\n');
        if (lastNewline !== -1) {
          buffer = buffer.slice(lastNewline + 2);
        }
      }

      return true;
    } catch (err: any) {
      // CRITICAL FIX: If we already received a proper terminal event (completed, error, cancelled),
      // don't push another one. This happens when ChatContent closes the connection after
      // receiving 'completed', which triggers an AbortError that we should ignore.
      // Without this check, we'd push a duplicate 'cancelled' event which triggers
      // ChatContent's retry logic and causes duplicate RAG API calls.
      if (hasReceivedTerminalEvent) {
        console.log('[SSEChat] AbortError after terminal event received - ignoring (already handled)');
        isWaitingForResponse.value = false;
        isStreaming.value = false;
        return true; // Return success since we completed normally
      }

      if (err.name === 'AbortError') {
        // Check if this was a timeout abort or user cancellation
        // Timeout aborts happen when we call abortController.abort() from timeout handler
        // If abortController is null, it was manually cancelled via cancelRequest()
        const wasTimeout = abortController !== null;

        if (wasTimeout) {
          console.warn('[SSEChat] Request aborted due to timeout');
          error.value = 'Connection timeout - server did not respond in time';
          const responseData: ChatResponse = {
            status: 'error',
            error: 'Connection timeout - server did not respond in time',
            timestamp: Date.now(),
          };
          response.value.push(responseData);

          // DIRECT CALLBACK: Notify store immediately
          if (onTerminalEvent) {
            console.log('[SSEChat] Calling onTerminalEvent callback for: timeout error');
            onTerminalEvent('error', responseData);
          }
        } else {
          // User cancelled
          console.log('[SSEChat] User cancelled - pushing cancelled response');
          const responseData: ChatResponse = {
            status: 'cancelled',
            timestamp: Date.now(),
          };
          response.value.push(responseData);
          console.log('[SSEChat] Cancelled response pushed, response.length:', response.value.length);

          // DIRECT CALLBACK: Notify store immediately
          if (onTerminalEvent) {
            console.log('[SSEChat] Calling onTerminalEvent callback for: user cancelled');
            onTerminalEvent('cancelled', responseData);
          }
        }
      } else {
        console.error('[SSEChat] Request failed:', err);
        error.value = err.message || 'Failed to start chat';
        const responseData: ChatResponse = {
          status: 'error',
          error: err.message,
          timestamp: Date.now(),
        };
        response.value.push(responseData);

        // DIRECT CALLBACK: Notify store immediately
        if (onTerminalEvent) {
          console.log('[SSEChat] Calling onTerminalEvent callback for: request error');
          onTerminalEvent('error', responseData);
        }
      }

      isWaitingForResponse.value = false;
      isStreaming.value = false;
      return false;
    }
  };

  /**
   * Start a streaming chat session (public wrapper)
   */
  const startChat = async (
    initialMessage: string,
    userInfo?: ChatUserInfo
  ): Promise<boolean> => {
    return startChatInternal(initialMessage, userInfo, false);
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
    console.log('[SSEChat] cancelRequest called for threadId:', threadId);

    // Abort the fetch request
    if (abortController) {
      console.log('[SSEChat] Aborting fetch request');
      abortController.abort();
      abortController = null;
    }

    // Also call the stop endpoint to stop server-side processing
    const stopUrl = `${config.public.pythonApiUrl}/api/v1/chat/${threadId}/stop`;
    console.log('[SSEChat] Calling stop endpoint:', stopUrl);

    try {
      const stopResponse = await fetch(stopUrl, {
        method: 'POST',
        headers: buildHeaders(),
      });

      console.log('[SSEChat] Stop response status:', stopResponse.status, 'ok:', stopResponse.ok);

      responsePhase.value = '';
      isWaitingForResponse.value = false;
      isStreaming.value = false;

      return stopResponse.ok;
    } catch (err) {
      console.error('[SSEChat] Stop endpoint error:', err);
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

  // Only register cleanup hook if autoCleanup is enabled (default) AND we're in a component context.
  // When used in a Pinia store, autoCleanup should be false to prevent lifecycle interference.
  const autoCleanup = options.autoCleanup !== false;
  if (autoCleanup && getCurrentInstance()) {
    onUnmounted(() => {
      disconnect();
    });
  }

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
