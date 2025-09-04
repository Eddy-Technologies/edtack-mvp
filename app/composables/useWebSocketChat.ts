import { ref, onUnmounted } from 'vue';

export enum GenerationIntentType {
  STANDARD_RESPONSE = 'standard_response',
  LESSON = 'lesson',
  QUIZ = 'quiz'
}

interface WebSocketMessage {
  type: 'start' | 'continue' | 'user_response' | 'cancel' | 'task_generation';
  payload?: string;
  user_info?: {
    subject?: string;
    level?: string;
    country?: string;
  };
}

interface WebSocketResponse {
  status: string;
  message?: string; // New field for structured responses
  generation_intent_type?: 'standard_response' | 'lesson' | 'quiz'; // New field for response types
  error?: string;
  is_complete?: boolean; // For partial responses
  timestamp?: number; // For heartbeat
  data?: any; // For additional data
  [key: string]: any;
}

export function useWebSocketChat(threadId: string) {
  const config = useRuntimeConfig();
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const isConnecting = ref(false);
  const response = ref<WebSocketResponse[]>([]);
  const error = ref<string | null>(null);
  const isWaitingForResponse = ref(false);
  const responsePhase = ref<string>('');

  const wsUrl = `${config.public.chatWsUrl}/api/v1/ws/chat/${threadId}`;

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

  const connect = () => {
    if (isConnecting.value || isConnected.value) return;

    isConnecting.value = true;
    error.value = null;

    // Create a new connection promise
    connectionPromise = new Promise<void>((resolve, reject) => {
      connectionResolver = resolve;
      connectionRejecter = reject;
    });

    try {
      ws.value = new WebSocket(wsUrl);

      ws.value.onopen = () => {
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
          const data: WebSocketResponse = JSON.parse(event.data);

          // Handle different message types
          if (data.status === 'heartbeat') {
            return; // Don't add heartbeat to messages
          }

          if (data.status === 'status_update') {
            responsePhase.value = data.phase || 'Processing...';
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

      ws.value.onerror = () => {
        error.value = 'Connection error occurred';
        if (connectionRejecter) {
          connectionRejecter(new Error('Connection error occurred'));
          connectionResolver = null;
          connectionRejecter = null;
        }
      };

      ws.value.onclose = () => {
        isConnected.value = false;
        isConnecting.value = false;

        // Reject connection promise if still pending
        if (connectionRejecter) {
          connectionRejecter(new Error('Connection closed'));
          connectionResolver = null;
          connectionRejecter = null;
        }

        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = reconnectDelay * Math.pow(2, reconnectAttempts - 1);

          reconnectTimeout = setTimeout(() => {
            connect();
          }, delay);
        } else {
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

  const sendMessage = (message: WebSocketMessage) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      error.value = 'WebSocket is not connected';
      return false;
    }

    try {
      ws.value.send(JSON.stringify(message));
      return true;
    } catch {
      error.value = 'Failed to send message';
      return false;
    }
  };

  const startChat = (initialMessage: string, userInfo?: WebSocketMessage['user_info']) => {
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

  const sendUserResponse = (response: string, userInfo?: WebSocketMessage['user_info']) => {
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

  const startTaskGeneration = (prompt: string, userInfo?: WebSocketMessage['user_info']) => {
    console.log('Starting task generation with prompt:', prompt, 'and userInfo:', userInfo);
    const success = sendMessage({
      type: 'start', // TODO: change to task_genration
      payload: prompt,
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

  onUnmounted(() => {
    disconnect();
  });

  return {
    connect,
    disconnect,
    waitForConnection,
    startChat,
    continueChat,
    sendUserResponse,
    startTaskGeneration,
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
