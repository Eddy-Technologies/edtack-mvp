import { ref, onUnmounted, getCurrentInstance } from 'vue';
import type { ChatMessage, ChatResponse, ChatOptions, ChatUserInfo } from './chat.types';

export interface UseWebSocketChatOptions extends ChatOptions {
  /**
   * If true (default), automatically disconnect when the component unmounts.
   * Set to false when using in a Pinia store to prevent lifecycle interference.
   */
  autoCleanup?: boolean;
}

export function useWebSocketChat(threadId: string, options: UseWebSocketChatOptions = {}) {
  const config = useRuntimeConfig();
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const isConnecting = ref(false);
  const response = ref<ChatResponse[]>([]);
  const error = ref<string | null>(null);
  const isWaitingForResponse = ref(false);
  const responsePhase = ref<string>('');

  // Build WebSocket URL with optional auth token
  const buildWsUrl = (token?: string) => {
    const baseUrl = `${config.public.chatWsUrl}/api/v1/ws/chat/${threadId}`;
    if (token && config.public.chatAuthEnabled) {
      return `${baseUrl}?token=${encodeURIComponent(token)}`;
    }
    return baseUrl;
  };

  let currentAuthToken = options.authToken;

  let reconnectTimeout: NodeJS.Timeout | null = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000;

  let connectionPromise: Promise<void> | null = null;
  let connectionResolver: (() => void) | null = null;
  let connectionRejecter: ((reason?: any) => void) | null = null;

  const clearReconnectTimer = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };

  const setAuthToken = (token: string) => {
    currentAuthToken = token;
  };

  const connect = (token?: string) => {
    console.log('[WebSocketChat] connect() called, isConnecting:', isConnecting.value, 'isConnected:', isConnected.value);
    if (isConnecting.value || isConnected.value) {
      console.log('[WebSocketChat] connect() early return - already connecting or connected');
      return;
    }

    // Update token if provided
    if (token) {
      currentAuthToken = token;
    }

    // Reset reconnect attempts on manual connect (allows retry after failure)
    reconnectAttempts = 0;
    console.log('[WebSocketChat] Reset reconnectAttempts to 0, proceeding with connection');

    isConnecting.value = true;
    error.value = null;

    // Create a new connection promise
    connectionPromise = new Promise<void>((resolve, reject) => {
      connectionResolver = resolve;
      connectionRejecter = reject;
    });

    try {
      const wsUrl = buildWsUrl(currentAuthToken);
      console.log('[WebSocketChat] Connecting to:', wsUrl.replace(/token=[^&]+/, 'token=***'));
      ws.value = new WebSocket(wsUrl);

      ws.value.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        isConnected.value = true;
        isConnecting.value = false;
        reconnectAttempts = 0;
        if (connectionResolver) {
          connectionResolver();
          connectionResolver = null;
          connectionRejecter = null;
        }
      };

      ws.value.onmessage = (event) => {
        try {
          const data: ChatResponse = JSON.parse(event.data);

          // Handle different message types
          if (data.status === 'heartbeat') {
            return; // Don't add heartbeat to messages
          }

          if (data.status === 'status_update') {
            responsePhase.value = data.phase || 'Processing...';
            return;
          }

          // Pass through batch messages for ChatContent to handle
          if (data.type === 'slide_batch_ready') {
            response.value.push(data);
            return;
          }

          // Handle completion types - these end the response
          if (['completed', 'timeout', 'cancelled', 'error', 'validation_error'].includes(data.status)) {
            isWaitingForResponse.value = false;
            responsePhase.value = '';
          }

          // Add all messages to the array
          response.value.push(data);

          // Set error state if present
          if (data.error) {
            error.value = data.error;
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.value.onerror = (event) => {
        console.error('[WebSocket] Connection error:', event);
        error.value = 'Connection error occurred';
        if (connectionRejecter) {
          connectionRejecter(new Error('Connection error occurred'));
          connectionResolver = null;
          connectionRejecter = null;
        }
      };

      ws.value.onclose = (event) => {
        console.log('[WebSocketChat] Connection closed, code:', event.code, 'reason:', event.reason, 'wasClean:', event.wasClean);
        isConnected.value = false;
        isConnecting.value = false;

        // Reset waiting state - if we were waiting for a response, the connection loss means it won't arrive
        if (isWaitingForResponse.value) {
          console.log('[WebSocketChat] Connection closed while waiting for response - resetting isWaitingForResponse');
          isWaitingForResponse.value = false;
          responsePhase.value = '';
        }

        // Reject connection promise if still pending
        if (connectionRejecter) {
          connectionRejecter(new Error('Connection closed'));
          connectionResolver = null;
          connectionRejecter = null;
        }

        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = reconnectDelay * Math.pow(2, reconnectAttempts - 1);
          console.log('[WebSocketChat] Reconnecting in', delay, 'ms (attempt', reconnectAttempts, 'of', maxReconnectAttempts, ')');
          reconnectTimeout = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.log('[WebSocketChat] Max reconnect attempts reached');
          error.value = 'Failed to establish connection after multiple attempts';
        }
      };
    } catch (err) {
      error.value = 'Failed to create connection';
      isConnecting.value = false;
      if (connectionRejecter) {
        connectionRejecter(err);
        connectionResolver = null;
        connectionRejecter = null;
      }
    }
  };

  const disconnect = () => {
    clearReconnectTimer();

    // Reject any pending connection promise
    if (connectionRejecter) {
      connectionRejecter(new Error('Manually disconnected'));
      connectionResolver = null;
      connectionRejecter = null;
    }

    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }

    isConnected.value = false;
    isConnecting.value = false;
    reconnectAttempts = maxReconnectAttempts; // Prevent auto-reconnect on manual disconnect
  };

  const sendMessage = (message: ChatMessage) => {
    console.log('[WebSocketChat] sendMessage called, type:', message.type, 'wsOpen:', ws.value?.readyState === WebSocket.OPEN);
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      console.log('[WebSocketChat] sendMessage failed - WebSocket not open, readyState:', ws.value?.readyState);
      error.value = 'WebSocket is not connected';
      return false;
    }

    try {
      ws.value.send(JSON.stringify(message));
      console.log('[WebSocketChat] sendMessage success');
      return true;
    } catch (e) {
      console.error('[WebSocketChat] sendMessage failed:', e);
      error.value = 'Failed to send message';
      return false;
    }
  };

  const startChat = (initialMessage: string, userInfo?: ChatUserInfo) => {
    const success = sendMessage({
      type: 'start',
      payload: initialMessage,
      user_info: userInfo,
    });
    if (success) {
      isWaitingForResponse.value = true;
    }
    return success;
  };

  const continueChat = () => {
    const success = sendMessage({
      type: 'continue',
    });
    if (success) {
      isWaitingForResponse.value = true;
    }
    return success;
  };

  const sendUserResponse = (response: string, userInfo?: ChatUserInfo) => {
    const success = sendMessage({
      type: 'user_response',
      payload: response,
      user_info: userInfo,
    });
    if (success) {
      isWaitingForResponse.value = true;
    }
    return success;
  };

  const cancelRequest = () => {
    responsePhase.value = '';
    return sendMessage({
      type: 'cancel',
    });
  };

  const clearMessages = () => {
    response.value = [];
  };

  const waitForConnection = (timeout: number = 5000): Promise<void> => {
    if (isConnected.value) {
      return Promise.resolve();
    }

    if (!connectionPromise) {
      return Promise.reject(new Error('No connection attempt in progress'));
    }

    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, timeout);
    });

    return Promise.race([connectionPromise, timeoutPromise]);
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
    response,
    isConnected,
    isConnecting,
    isWaitingForResponse,
    error,
    responsePhase,
  };
}
