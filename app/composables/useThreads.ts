import { ref, computed, readonly } from 'vue';
import { useMeStore } from '~/stores/me';
import type { PostMessageReq } from '~~/server/api/chat/message.post';
import type { Database } from '~~/types/supabase';

type Thread = Database['public']['Tables']['threads']['Row'];
type Message = Database['public']['Tables']['thread_messages']['Row'];

// Global state
const threads = ref<Thread[]>([]);
const messageHistory = ref<Message[]>([]);
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
      const response = await $fetch(`/api/chat/user/${currentUserId}`, { method: 'GET' });
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

  // Fetch specific thread with messageHistory
  const fetchThread = async (threadId: string) => {
    try {
      const { threadData, success } = await $fetch(`/api/chat/thread/${threadId}`, { method: 'GET' });

      if (!success) {
        throw new Error('Thread not found');
      }

      messageHistory.value = threadData?.thread_messages || [];
      return { thread: threadData, messageHistory: threadData?.thread_messages || [], task: threadData?.task_threads || null };
    } catch (err) {
      console.error('Error loading thread:', err);
      reset();
    }
  };

  // Create new thread
  const createThread = async (data: { title: string; subject?: string }) => {
    try {
      const response = await $fetch('/api/chat/thread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.success || !response.data) {
        throw new Error(`Failed to create thread`);
      }

      const newThread = response.data;

      // Add to local threads list
      threads.value.unshift(newThread);
      messageHistory.value = [];

      return newThread;
    } catch (err) {
      console.error('Thread creation error:', err);
      error.value = 'Failed to create new chat';
      throw err;
    }
  };

  // Add message to current thread (handles all message types)
  const addMessage = async ({ thread_id, content, type, isUser, uuid }: PostMessageReq) => {
    const body: PostMessageReq = { thread_id, content, type, isUser, uuid };

    const response = await $fetch('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!response.success || !response.data) {
      throw new Error('Failed to send message');
    }

    messageHistory.value.push(response.data);
  };

  // Reset all state
  const reset = () => {
    messageHistory.value = [];
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
    messageHistory: readonly(messageHistory),
    isLoadingThreads: readonly(isLoadingThreads),
    isLoadingThread: readonly(isLoadingThread),
    error: readonly(error),

    // Actions
    fetchThreads,
    fetchThread,
    createThread,
    addMessage,
    reset,

    // Pending message management
    setPendingMessage,
    getPendingMessage,
    clearPendingMessage,
  };
}
