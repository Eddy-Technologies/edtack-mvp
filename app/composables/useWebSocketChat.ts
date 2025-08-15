import { ref, onUnmounted } from 'vue';

export enum GenerationIntentType {
  STANDARD_RESPONSE = 'standard_response',
  LESSON = 'lesson',
  QUIZ = 'quiz'
}

interface WebSocketMessage {
  type: 'start' | 'continue' | 'user_response' | 'cancel';
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

    try {
      ws.value = new WebSocket(wsUrl);

      ws.value.onopen = () => {
        isConnected.value = true;
        isConnecting.value = false;
        reconnectAttempts = 0;
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
          if (['complete', 'response', 'user_message', 'timeout', 'cancelled', 'error'].includes(data.status)) {
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
      };

      ws.value.onclose = () => {
        isConnected.value = false;
        isConnecting.value = false;

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
    } catch {
      error.value = 'Failed to create connection';
      isConnecting.value = false;
    }
  };

  const disconnect = () => {
    clearReconnectTimer();

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

  const cancelRequest = () => {
    responsePhase.value = '';
    return sendMessage({
      type: 'cancel',
    });
  };

  const clearMessages = () => {
    response.value = [];
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    connect,
    disconnect,
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
