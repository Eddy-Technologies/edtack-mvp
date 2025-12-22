import { ref, onUnmounted } from 'vue';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useSupabaseClient } from '#imports';
import { useMessageQueueStore } from '~/stores/messageQueue';
import type { Database } from '~~/types/supabase';

type ThreadMessage = Database['public']['Tables']['thread_messages']['Row'];

interface RealtimeSubscription {
  threadId: string;
  channel: RealtimeChannel;
  createdAt: number;
}

/**
 * Manages Supabase Realtime subscriptions for cross-device/cross-tab sync.
 * Subscribes to thread_messages table and updates Pinia store on changes.
 */
export function useRealtimeSync() {
  const supabase = useSupabaseClient<Database>();
  const store = useMessageQueueStore();

  // Track active subscriptions
  const subscriptions = ref<Map<string, RealtimeSubscription>>(new Map());

  /**
   * Subscribe to messages for a specific thread
   */
  function subscribeToThread(threadId: string): RealtimeChannel {
    // Check if already subscribed
    const existing = subscriptions.value.get(threadId);
    if (existing) {
      return existing.channel;
    }

    const channel = supabase
      .channel(`thread-messages:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'thread_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const newMessage = payload.new as ThreadMessage;

          // Skip if message originated from this device (check UUID)
          if (store.isLocalMessage(newMessage.id)) {
            console.log('[RealtimeSync] Skipping local message:', newMessage.id);
            return;
          }

          console.log('[RealtimeSync] Received message from another device:', newMessage.id);
          store.addMessageFromRealtime(threadId, newMessage);
        }
      )
      .subscribe((status) => {
        console.log(`[RealtimeSync] Thread ${threadId} subscription status:`, status);
      });

    subscriptions.value.set(threadId, {
      threadId,
      channel,
      createdAt: Date.now(),
    });

    return channel;
  }

  /**
   * Unsubscribe from a specific thread
   */
  async function unsubscribeFromThread(threadId: string): Promise<void> {
    const subscription = subscriptions.value.get(threadId);
    if (subscription) {
      await supabase.removeChannel(subscription.channel);
      subscriptions.value.delete(threadId);
      console.log(`[RealtimeSync] Unsubscribed from thread ${threadId}`);
    }
  }

  /**
   * Subscribe to all active threads (for initial load)
   */
  function subscribeToActiveThreads(threadIds: string[]): void {
    for (const threadId of threadIds) {
      subscribeToThread(threadId);
    }
  }

  /**
   * Unsubscribe from all threads
   */
  async function unsubscribeAll(): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const threadId of subscriptions.value.keys()) {
      promises.push(unsubscribeFromThread(threadId));
    }
    await Promise.all(promises);
  }

  /**
   * Get active subscription count
   */
  function getActiveSubscriptionCount(): number {
    return subscriptions.value.size;
  }

  /**
   * Check if subscribed to a thread
   */
  function isSubscribedTo(threadId: string): boolean {
    return subscriptions.value.has(threadId);
  }

  // Cleanup on unmount
  onUnmounted(() => {
    // Note: We intentionally don't unsubscribe on unmount
    // because we want subscriptions to persist across navigation.
    // Subscriptions will be cleaned up when the page is closed
    // or when explicitly unsubscribed.
  });

  return {
    subscribeToThread,
    unsubscribeFromThread,
    subscribeToActiveThreads,
    unsubscribeAll,
    getActiveSubscriptionCount,
    isSubscribedTo,
    subscriptions,
  };
}

/**
 * Global realtime sync instance (singleton pattern for app-wide subscriptions)
 */
let globalRealtimeSync: ReturnType<typeof useRealtimeSync> | null = null;

export function useGlobalRealtimeSync() {
  if (!globalRealtimeSync) {
    globalRealtimeSync = useRealtimeSync();
  }
  return globalRealtimeSync;
}
