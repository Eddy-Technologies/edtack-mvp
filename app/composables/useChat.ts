import { computed, type MaybeRef, toValue } from 'vue';
import { useWebSocketChat, type UseWebSocketChatOptions } from './useWebSocketChat';
import { useSSEChat, type UseSSEChatOptions } from './useSSEChat';
import { useSupabaseClient } from '#imports';
import { useMessageQueueStore, type ThreadStatus, type QueuedMessage } from '~/stores/messageQueue';
import { useGlobalRealtimeSync } from '~/composables/useRealtimeSync';
import type { ChatUserInfo, ChatResponse } from '~/composables/chat.types';

export type ChatMode = 'websocket' | 'sse';

export interface UseChatOptions {
  authToken?: string;
}

/**
 * Get a fresh Supabase access token for authentication.
 * Uses refreshSession() to ensure the token is valid, since getSession()
 * only returns the cached token which may be expired.
 */
export async function getSupabaseAccessToken(): Promise<string | null> {
  const supabase = useSupabaseClient();

  try {
    // refreshSession() ensures we get a valid token, unlike getSession() which
    // just returns the cached token from localStorage (potentially expired)
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      // If refresh fails (e.g., refresh token expired), fall back to cached session
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    }
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Failed to get Supabase access token:', error);
    return null;
  }
}

/**
 * Helper composable to get auth headers for Python API calls
 * Used by pythonApi.ts and markingApi.ts
 */
export async function getPythonApiAuthHeaders(): Promise<Record<string, string>> {
  const config = useRuntimeConfig();
  const headers: Record<string, string> = {};

  if (config.public.chatAuthEnabled) {
    const token = await getSupabaseAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Raw chat connection - internal use only.
 * Use `useChat` for component-level chat with background processing support.
 */
export function useChatConnection(threadId: string, options: UseChatOptions = {}) {
  const config = useRuntimeConfig();
  const chatMode = (config.public.chatMode as ChatMode) || 'websocket';
  const authEnabled = config.public.chatAuthEnabled;

  // Create the appropriate chat instance based on mode
  if (chatMode === 'sse') {
    // Disable autoCleanup since connections are managed by the Pinia store's connection pool
    const sseOptions: UseSSEChatOptions = {
      authToken: options.authToken,
      autoCleanup: false,
    };
    const sseChat = useSSEChat(threadId, sseOptions);

    // Wrap connect to handle auth token fetching
    const originalConnect = sseChat.connect;
    const wrappedConnect = async (token?: string) => {
      let authToken = token || options.authToken;

      // Fetch token if auth is enabled and no token provided
      if (authEnabled && !authToken) {
        authToken = await getSupabaseAccessToken() || undefined;
      }

      originalConnect(authToken);
    };

    return {
      ...sseChat,
      connect: wrappedConnect,
      mode: 'sse' as const,
    };
  }

  // Default: WebSocket mode
  // Disable autoCleanup since connections are managed by the Pinia store's connection pool
  const wsOptions: UseWebSocketChatOptions = {
    authToken: options.authToken,
    autoCleanup: false,
  };
  const wsChat = useWebSocketChat(threadId, wsOptions);

  // Wrap connect to handle auth token fetching
  const originalConnect = wsChat.connect;
  const wrappedConnect = async (token?: string) => {
    let authToken = token || options.authToken;

    // Fetch token if auth is enabled and no token provided
    if (authEnabled && !authToken) {
      authToken = await getSupabaseAccessToken() || undefined;
    }

    originalConnect(authToken);
  };

  return {
    ...wsChat,
    connect: wrappedConnect,
    mode: 'websocket' as const,
  };
}

// ============================================================================
// Main useChat interface - uses global store for background processing support
// ============================================================================

export interface UseChatReturn {
  // Connection state (all computed/reactive)
  isConnected: { readonly value: boolean };
  isConnecting: { readonly value: boolean };
  isProcessing: { readonly value: boolean };
  isWaitingForResponse: { readonly value: boolean };

  // Thread state (all computed/reactive)
  threadStatus: { readonly value: ThreadStatus };
  responsePhase: { readonly value: string };
  hasPartialSlides: { readonly value: boolean };
  error: { readonly value: string | null };

  // Messages (computed/reactive)
  cachedMessages: { readonly value: any[] };
  response: { readonly value: ChatResponse[] };

  // Actions
  connect: () => Promise<boolean>;
  disconnect: () => void;
  startChat: (message: string, userInfo?: ChatUserInfo) => Promise<boolean>;
  continueChat: () => Promise<boolean>;
  sendUserResponse: (response: string, userInfo?: ChatUserInfo) => Promise<boolean>;
  cancelRequest: () => boolean;
  clearMessages: () => void;
  waitForConnection: (timeout?: number) => Promise<void>;
}

/**
 * Main chat composable with background processing and cross-device sync.
 *
 * Features:
 * - Connections persist when navigating away (background processing)
 * - Cross-device sync via Supabase Realtime
 * - localStorage persistence for page refresh survival
 * - UUID-based deduplication
 *
 * Usage:
 * ```ts
 * const chat = useChat(threadId);
 * await chat.connect();
 * chat.startChat('Hello!', { subject: 'math', level: 'secondary' });
 * ```
 */
export function useChat(threadId: MaybeRef<string>): UseChatReturn {
  const store = useMessageQueueStore();
  const realtimeSync = useGlobalRealtimeSync();

  // Initialize store if not already
  store.init();

  // Resolve threadId (support both ref and string)
  const resolvedThreadId = computed(() => toValue(threadId));

  // Thread state from store (reactive)
  const threadState = computed(() => store.getThreadState(resolvedThreadId.value));
  const threadStatus = computed<ThreadStatus>(() => threadState.value?.status || 'idle');
  const responsePhase = computed(() => threadState.value?.responsePhase || '');
  const hasPartialSlides = computed(() => threadState.value?.hasPartialSlides || false);
  const error = computed(() => threadState.value?.error || null);

  // Connection state (reactive - derived from pooled connection)
  // NOTE: Access store properties directly (not $state) for proper Pinia reactivity
  const pooledConnection = computed(() => {
    // Access connectionVersion to establish reactive dependency
    void store.connectionVersion;
    return store.connections[resolvedThreadId.value];
  });

  const isConnected = computed(() => {
    const conn = pooledConnection.value;
    return conn?.chat.isConnected.value || false;
  });

  const isConnecting = computed(() => {
    const conn = pooledConnection.value;
    return conn?.chat.isConnecting?.value || false;
  });

  const isWaitingForResponse = computed(() => {
    const conn = pooledConnection.value;
    return conn?.chat.isWaitingForResponse?.value || false;
  });

  // Processing state (derived from thread status)
  const isProcessing = computed(() => store.isProcessing(resolvedThreadId.value));

  // Cached messages from store
  const cachedMessages = computed(() => store.getCachedMessages(resolvedThreadId.value));

  // Response array (reactive - from pooled connection)
  const response = computed(() => {
    // Also access connectionVersion for reactivity
    void store.connectionVersion;
    const conn = store.connections[resolvedThreadId.value];
    return conn?.chat.response.value || [];
  });

  /**
   * Connect to chat (creates or reuses pooled connection)
   */
  async function connect(): Promise<boolean> {
    const tid = resolvedThreadId.value;
    console.log('[useChat] connect() called for threadId:', tid);

    const success = await store.connect(tid);
    console.log('[useChat] store.connect() result:', success);

    if (success) {
      // Subscribe to Realtime for cross-device sync
      realtimeSync.subscribeToThread(tid);

      // Replay any pending messages
      await store.replayPendingMessages(tid);
    }

    return success;
  }

  /**
   * Disconnect from chat (closes pooled connection)
   */
  function disconnect(): void {
    const tid = resolvedThreadId.value;
    console.log('[useChat] disconnect() called for threadId:', tid);
    store.closeConnection(tid);
    realtimeSync.unsubscribeFromThread(tid);
    console.log('[useChat] disconnect() completed');
  }

  /**
   * Wait for connection to be established
   */
  async function waitForConnection(timeout: number = 5000): Promise<void> {
    const tid = resolvedThreadId.value;
    const conn = store.getConnection(tid);

    if (!conn) {
      throw new Error('No connection attempt in progress');
    }

    return conn.chat.waitForConnection(timeout);
  }

  /**
   * Start a new chat conversation
   */
  async function startChat(message: string, userInfo?: ChatUserInfo): Promise<boolean> {
    const tid = resolvedThreadId.value;
    console.log('[useChat] startChat called for threadId:', tid);

    let currentConn = store.getConnection(tid);
    console.log('[useChat] Current connection:', !!currentConn, 'isConnected:', currentConn?.chat.isConnected.value);

    if (!currentConn || !currentConn.chat.isConnected.value) {
      console.log('[useChat] Not connected, attempting to connect...');
      const connected = await connect();
      if (!connected) {
        console.log('[useChat] Connection failed, returning false');
        return false;
      }
      // Re-fetch connection after successful connect
      currentConn = store.getConnection(tid);
    }

    console.log('[useChat] After connect check, currentConn:', !!currentConn);

    // Retry once if connection was lost due to race condition
    if (!currentConn) {
      console.log('[useChat] Connection lost, retrying connect...');
      const retryConnected = await connect();
      if (!retryConnected) {
        console.log('[useChat] Retry connection failed, returning false');
        return false;
      }
      currentConn = store.getConnection(tid);
      console.log('[useChat] After retry, currentConn:', !!currentConn);
      if (!currentConn) {
        console.log('[useChat] Connection still null after retry, returning false');
        return false;
      }
    }

    // Generate UUID for deduplication
    const uuid = crypto.randomUUID();
    store.trackLocalMessage(uuid);

    // Enqueue message for retry support
    const queuedMessage: QueuedMessage = {
      uuid,
      threadId: tid,
      content: message,
      type: 'text',
      isUser: true,
      status: 'sending',
      retryCount: 0,
      createdAt: Date.now(),
    };
    store.enqueuePendingMessage(queuedMessage);

    // Set processing state (isWaitingForResponse computed from this)
    store.setThreadState(tid, { status: 'processing' });

    // Send via WebSocket/SSE
    console.log('[useChat] Calling currentConn.chat.startChat...');
    const success = await currentConn.chat.startChat(message, userInfo);
    console.log('[useChat] startChat result:', success);

    if (success) {
      store.updatePendingMessage(tid, uuid, { status: 'sent' });
    } else {
      store.updatePendingMessage(tid, uuid, { status: 'failed' });
      store.setThreadState(tid, { status: 'error' });
    }

    return success;
  }

  /**
   * Continue chat conversation
   */
  async function continueChat(): Promise<boolean> {
    const tid = resolvedThreadId.value;
    const conn = store.getConnection(tid);

    if (!conn || !conn.chat.isConnected.value) {
      const connected = await connect();
      if (!connected) return false;
    }

    const currentConn = store.getConnection(tid);
    if (!currentConn) return false;

    store.setThreadState(tid, { status: 'processing' });
    return currentConn.chat.continueChat();
  }

  /**
   * Send user response (for follow-up messages)
   */
  async function sendUserResponse(responseText: string, userInfo?: ChatUserInfo): Promise<boolean> {
    const tid = resolvedThreadId.value;
    let currentConn = store.getConnection(tid);

    if (!currentConn || !currentConn.chat.isConnected.value) {
      const connected = await connect();
      if (!connected) return false;
      currentConn = store.getConnection(tid);
    }

    // Retry once if connection was lost due to race condition
    if (!currentConn) {
      const retryConnected = await connect();
      if (!retryConnected) return false;
      currentConn = store.getConnection(tid);
      if (!currentConn) return false;
    }

    // Generate UUID for deduplication
    const uuid = crypto.randomUUID();
    store.trackLocalMessage(uuid);

    // Enqueue message
    const queuedMessage: QueuedMessage = {
      uuid,
      threadId: tid,
      content: responseText,
      type: 'text',
      isUser: true,
      status: 'sending',
      retryCount: 0,
      createdAt: Date.now(),
    };
    store.enqueuePendingMessage(queuedMessage);

    store.setThreadState(tid, { status: 'processing' });

    const success = await currentConn.chat.sendUserResponse(responseText, userInfo);

    if (success) {
      store.updatePendingMessage(tid, uuid, { status: 'sent' });
    } else {
      store.updatePendingMessage(tid, uuid, { status: 'failed' });
      store.setThreadState(tid, { status: 'error' });
    }

    return success;
  }

  /**
   * Cancel current request
   */
  function cancelRequest(): boolean {
    const tid = resolvedThreadId.value;
    const conn = store.getConnection(tid);

    if (!conn) return false;

    const success = conn.chat.cancelRequest();

    if (success) {
      store.setThreadState(tid, {
        status: 'cancelled',
        responsePhase: '',
      });
    }

    return success;
  }

  /**
   * Clear messages
   */
  function clearMessages(): void {
    const tid = resolvedThreadId.value;
    const conn = store.getConnection(tid);

    if (conn) {
      conn.chat.clearMessages();
    }

    store.clearMessageCache(tid);
    // response is computed from connection, will update reactively
  }

  return {
    // Connection state
    isConnected,
    isConnecting,
    isProcessing,
    isWaitingForResponse,

    // Thread state
    threadStatus,
    responsePhase,
    hasPartialSlides,
    error,

    // Messages
    cachedMessages,
    response,

    // Actions
    connect,
    disconnect,
    startChat,
    continueChat,
    sendUserResponse,
    cancelRequest,
    clearMessages,
    waitForConnection,
  };
}
