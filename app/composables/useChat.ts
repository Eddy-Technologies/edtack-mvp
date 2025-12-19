import { useWebSocketChat, type UseWebSocketChatOptions } from './useWebSocketChat';
import { useSSEChat, type UseSSEChatOptions } from './useSSEChat';
import { useSupabaseClient } from '#imports';

export type ChatMode = 'websocket' | 'sse';

export interface UseChatOptions {
  authToken?: string;
}

/**
 * Get the current Supabase access token for authentication
 */
export async function getSupabaseAccessToken(): Promise<string | null> {
  const supabase = useSupabaseClient();

  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Failed to get Supabase access token:', error);
    return null;
  }
}

/**
 * Unified chat composable that switches between WebSocket and SSE based on config
 *
 * Usage:
 * ```ts
 * const chat = useChat(threadId);
 * await chat.connect();
 * chat.startChat('Hello!', { subject: 'math', level: 'secondary' });
 * ```
 *
 * The mode is controlled by NUXT_PUBLIC_CHAT_MODE env variable:
 * - 'websocket' (default): Uses WebSocket for bidirectional real-time chat
 * - 'sse': Uses SSE (Server-Sent Events) + REST API for streaming responses
 *
 * Authentication is controlled by NUXT_PUBLIC_CHAT_AUTH_ENABLED:
 * - 'true': Includes Supabase access token in requests
 * - 'false': No authentication (for local development)
 */
export function useChat(threadId: string, options: UseChatOptions = {}) {
  const config = useRuntimeConfig();
  const chatMode = (config.public.chatMode as ChatMode) || 'websocket';
  const authEnabled = config.public.chatAuthEnabled;

  // Create the appropriate chat instance based on mode
  if (chatMode === 'sse') {
    const sseOptions: UseSSEChatOptions = {
      authToken: options.authToken,
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
  const wsOptions: UseWebSocketChatOptions = {
    authToken: options.authToken,
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
