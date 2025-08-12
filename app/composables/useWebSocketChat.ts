import { ref, onUnmounted } from 'vue';

interface WebSocketMessage {
  type: 'start' | 'continue' | 'user_response';
  payload?: string;
  user_info?: {
    subject?: string;
    level?: string;
    country?: string;
  };
}

interface WebSocketResponse {
  type: string;
  content?: string;
  error?: string;
  [key: string]: any;
}

export function useWebSocketChat(threadId: string) {
  const config = useRuntimeConfig();
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const isConnecting = ref(false);
  const messages = ref<WebSocketResponse[]>([]);
  const error = ref<string | null>(null);

  const wsUrl = `${config.public.chatWsUrl}/api/v1/ws/chat/${threadId}`;

  let reconnectTimeout: NodeJS.Timeout | null = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000;

  const connect = () => {
    if (isConnecting.value || isConnected.value) return;

    isConnecting.value = true;
    error.value = null;
    
    console.log(`Attempting to connect to WebSocket: ${wsUrl}`); // Debug log

    try {
      ws.value = new WebSocket(wsUrl);

      ws.value.onopen = () => {
        console.log(`✅ WebSocket connected successfully to thread: ${threadId}`);
        isConnected.value = true;
        isConnecting.value = false;
        reconnectAttempts = 0;
      };

      ws.value.onmessage = (event) => {
        try {
          const data: WebSocketResponse = JSON.parse(event.data);
          messages.value.push(data);

          if (data.error) {
            error.value = data.error;
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.value.onerror = (event) => {
        console.error('❌ WebSocket error:', event);
        console.error('WebSocket URL:', wsUrl);
        error.value = 'Connection error occurred';
      };

      ws.value.onclose = (event) => {
        console.log(`WebSocket disconnected - Code: ${event.code}, Reason: ${event.reason}`);
        isConnected.value = false;
        isConnecting.value = false;

        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = reconnectDelay * Math.pow(2, reconnectAttempts - 1);
          console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);

          reconnectTimeout = setTimeout(() => {
            connect();
          }, delay);
        } else {
          error.value = 'Failed to establish connection after multiple attempts';
        }
      };
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
      error.value = 'Failed to create connection';
      isConnecting.value = false;
    }
  };

  const disconnect = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
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
    } catch (e) {
      console.error('Failed to send message:', e);
      error.value = 'Failed to send message';
      return false;
    }
  };

  const startChat = (initialMessage: string, userInfo?: WebSocketMessage['user_info']) => {
    return sendMessage({
      type: 'start',
      payload: initialMessage,
      user_info: userInfo,
    });
  };

  const continueChat = () => {
    return sendMessage({
      type: 'continue',
    });
  };

  const sendUserResponse = (response: string, userInfo?: WebSocketMessage['user_info']) => {
    return sendMessage({
      type: 'user_response',
      payload: response,
      user_info: userInfo,
    });
  };

  const clearMessages = () => {
    messages.value = [];
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
    clearMessages,
    messages,
    isConnected,
    isConnecting,
    error,
  };
}
