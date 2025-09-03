import { ref, computed, readonly } from 'vue';
import { useMeStore } from '~/stores/me';
import type { GetChatThreadRes } from '~~/server/api/chat/[threadId].get';

interface Thread {
  id: string;
  title: string;
  subject: string;
  user_infos_id: string;
  created_at: string;
  updated_at: string;
  task_threads?: any;
}

interface Message {
  id?: string;
  thread_id?: string;
  content?: string;
  sender?: string;
  type?: string;
  created_at?: string;
  text?: string;
  isUser?: boolean;
  message?: string;
  slides?: any[];
  [key: string]: any;
}

// Global state
const threads = ref<Thread[]>([]);
const currentThread = ref<Thread | null>(null);
const messages = ref<Message[]>([]);
const isLoadingThreads = ref(false);
const isLoadingThread = ref(false);
const error = ref<string | null>(null);
const pendingMessage = ref<string | null>(null);

export function useThreads() {
  const meStore = useMeStore();

  // Computed for better reactivity
  const userId = computed(() => meStore.user_info_id || meStore.id);

  // Fetch all threads for current user
  const fetchThreads = async (forceRefresh = false) => {
    const currentUserId = userId.value;
    if (!currentUserId) {
      console.warn('No user ID available');
      return;
    }

    // Skip if already loaded and not forcing refresh
    if (!forceRefresh && threads.value.length > 0) {
      return;
    }

    isLoadingThreads.value = true;
    error.value = null;

    try {
      const response = await $fetch(`/api/chat/threads/${currentUserId}`);
      if (!response?.success) {
        throw new Error('Failed to fetch threads');
      }

      threads.value = response.data || [];
    } catch (err) {
      console.error('Failed to fetch chat threads:', err);
      error.value = 'Failed to load chat history';
      threads.value = [];
    } finally {
      isLoadingThreads.value = false;
    }
  };

  // Fetch specific thread with messages
  const fetchThread = async (threadId: string) => {
    if (!threadId || threadId === 'new') {
      currentThread.value = null;
      messages.value = [];
      return { thread: null, messages: [], task: null };
    }

    isLoadingThread.value = true;
    error.value = null;

    try {
      const { messageData, task, success }: GetChatThreadRes = await $fetch(`/api/chat/${threadId}`);

      if (!success) {
        throw new Error('Thread not found');
      }

      // Find thread in our cached threads
      const thread = threads.value.find((t) => t.id === threadId);
      currentThread.value = thread || null;

      // Process messages with consistent field mapping
      const processedMessages = messageData?.map((message) => ({
        ...message,
        text: message.content,
        isUser: !!message.sender,
        type: message.type || 'text',
      })) || [];

      messages.value = processedMessages;

      return { thread: currentThread.value, messages: processedMessages, task };
    } catch (err) {
      console.error('Error loading thread:', err);
      error.value = 'Failed to load chat thread';
      currentThread.value = null;
      messages.value = [];
      return { thread: null, messages: [], task: null };
    } finally {
      isLoadingThread.value = false;
    }
  };

  // Create new thread
  const createThread = async (data: { title: string; subject?: string }) => {
    try {
      const response = await fetch('/api/chat/thread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create thread: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      const newThread = result.data;

      // Add to local threads list
      threads.value.unshift(newThread);
      currentThread.value = newThread;
      messages.value = [];

      return newThread;
    } catch (err) {
      console.error('Thread creation error:', err);
      error.value = 'Failed to create new chat';
      throw err;
    }
  };

  // Add message to current thread (handles all message types)
  const addMessage = (messageData: Partial<Message> | any) => {
    if (!currentThread.value) return;

    // Handle both regular messages and WebSocket messages
    const message: Message = {
      id: messageData.id || Date.now().toString(),
      thread_id: currentThread.value.id,
      content: messageData.content || messageData.message || messageData.text || '',
      created_at: messageData.created_at || new Date().toISOString(),
      type: messageData.type || 'text',
      sender: messageData.sender,
      text: messageData.content || messageData.message || messageData.text || '',
      isUser: messageData.isUser !== undefined ?
        messageData.isUser :
        messageData.status === 'user_message' ?
          false :
            !!messageData.sender,
      message: messageData.message,
      slides: messageData.slides,
      ...messageData,
    };

    messages.value.push(message);
  };

  // Clear current thread
  const clearCurrentThread = () => {
    currentThread.value = null;
    messages.value = [];
  };

  // Reset all state
  const reset = () => {
    threads.value = [];
    currentThread.value = null;
    messages.value = [];
    error.value = null;
    pendingMessage.value = null;
    if (import.meta.client) {
      sessionStorage.removeItem('pendingMessage');
    }
  };

  // Pending message methods
  const setPendingMessage = (message: string) => {
    pendingMessage.value = message;
    if (import.meta.client) {
      sessionStorage.setItem('pendingMessage', message);
    }
  };

  const getPendingMessage = (): string | null => {
    if (pendingMessage.value) {
      return pendingMessage.value;
    }
    if (import.meta.client) {
      return sessionStorage.getItem('pendingMessage');
    }
    return null;
  };

  const clearPendingMessage = () => {
    pendingMessage.value = null;
    if (import.meta.client) {
      sessionStorage.removeItem('pendingMessage');
    }
  };

  return {
    // State
    threads: readonly(threads),
    currentThread: readonly(currentThread),
    messages: readonly(messages),
    isLoadingThreads: readonly(isLoadingThreads),
    isLoadingThread: readonly(isLoadingThread),
    error: readonly(error),

    // Actions
    fetchThreads,
    fetchThread,
    createThread,
    addMessage,
    clearCurrentThread,
    reset,

    // Pending message management
    setPendingMessage,
    getPendingMessage,
    clearPendingMessage,
  };
}
