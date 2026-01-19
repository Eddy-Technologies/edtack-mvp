import { ref } from 'vue';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useSupabaseClient } from '#imports';
import type { Database } from '~~/types/supabase';

type Order = Database['public']['Tables']['orders']['Row'];

// Module-level singleton state - version counters for reactive updates
const creditsVersion = ref(0);
const tasksVersion = ref(0);
const ordersVersion = ref(0);
const orderRequestsVersion = ref(0);
const wishlistVersion = ref(0);

/**
 * Manages Supabase Realtime subscriptions for user-specific data.
 * Subscribes to user_credits, user_tasks, and orders tables.
 * Components can watch version counters to react to changes.
 */
export function useUserRealtimeSync() {
  const supabase = useSupabaseClient<Database>();
  const channel = ref<RealtimeChannel | null>(null);
  const isSubscribed = ref(false);

  /**
   * Subscribe to realtime updates for user data
   * @param userInfoId - The current user's info ID
   * @param isParent - Whether the user is a parent
   * @param childUserInfoIds - IDs of children (for parents)
   */
  function subscribe(
    userInfoId: string,
    isParent: boolean,
    childUserInfoIds: string[] = []
  ): void {
    // Prevent duplicate subscriptions
    if (channel.value) {
      console.log('[UserRealtimeSync] Already subscribed');
      return;
    }

    console.log('[UserRealtimeSync] Setting up subscriptions for user:', userInfoId);

    const realtimeChannel = supabase.channel(`user-updates:${userInfoId}`);

    // Subscribe to own credits
    realtimeChannel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_credits',
        filter: `user_info_id=eq.${userInfoId}`,
      },
      (payload) => {
        console.log('[UserRealtimeSync] Credits changed:', payload.eventType);
        creditsVersion.value++;
      }
    );

    // For parents: also subscribe to children's credits
    for (const childId of childUserInfoIds) {
      realtimeChannel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_info_id=eq.${childId}`,
        },
        (payload) => {
          console.log('[UserRealtimeSync] Child credits changed:', payload.eventType);
          creditsVersion.value++;
        }
      );
    }

    // Subscribe to tasks based on role
    if (isParent) {
      // Parents see tasks they created
      realtimeChannel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tasks',
          filter: `creator_user_info_id=eq.${userInfoId}`,
        },
        (payload) => {
          console.log('[UserRealtimeSync] Task changed (creator):', payload.eventType);
          tasksVersion.value++;
        }
      );
    } else {
      // Students see tasks assigned to them
      realtimeChannel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tasks',
          filter: `assignee_user_info_id=eq.${userInfoId}`,
        },
        (payload) => {
          console.log('[UserRealtimeSync] Task changed (assignee):', payload.eventType);
          tasksVersion.value++;
        }
      );
    }

    // Subscribe to own orders
    realtimeChannel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_info_id=eq.${userInfoId}`,
      },
      (payload) => {
        console.log('[UserRealtimeSync] Order changed:', payload.eventType);
        ordersVersion.value++;
      }
    );

    // For parents: subscribe to children's orders for approval requests
    for (const childId of childUserInfoIds) {
      realtimeChannel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_info_id=eq.${childId}`,
        },
        (payload) => {
          console.log('[UserRealtimeSync] Child order changed:', payload.eventType);
          // Always refresh order requests for parents when child orders change
          // (covers new requests AND approvals/rejections)
          orderRequestsVersion.value++;
          ordersVersion.value++;
        }
      );
    }

    // Subscribe to own wishlist
    realtimeChannel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'wishlists',
        filter: `user_info_id=eq.${userInfoId}`,
      },
      (payload) => {
        console.log('[UserRealtimeSync] Wishlist changed:', payload.eventType);
        wishlistVersion.value++;
      }
    );

    // Subscribe to channel
    realtimeChannel.subscribe((status) => {
      console.log('[UserRealtimeSync] Subscription status:', status);
      isSubscribed.value = status === 'SUBSCRIBED';

      if (status === 'CHANNEL_ERROR') {
        console.error('[UserRealtimeSync] Channel error, will retry...');
        // Supabase client handles reconnection automatically
      }
    });

    channel.value = realtimeChannel;
  }

  /**
   * Unsubscribe from all realtime updates
   */
  async function unsubscribe(): Promise<void> {
    if (channel.value) {
      await supabase.removeChannel(channel.value);
      channel.value = null;
      isSubscribed.value = false;
      console.log('[UserRealtimeSync] Unsubscribed');
    }
  }

  return {
    subscribe,
    unsubscribe,
    isSubscribed,
    // Expose version counters for components to watch
    creditsVersion,
    tasksVersion,
    ordersVersion,
    orderRequestsVersion,
    wishlistVersion,
  };
}

/**
 * Global user realtime sync instance (singleton pattern)
 */
let globalUserRealtimeSync: ReturnType<typeof useUserRealtimeSync> | null = null;

export function useGlobalUserRealtimeSync() {
  if (!globalUserRealtimeSync) {
    globalUserRealtimeSync = useUserRealtimeSync();
  }
  return globalUserRealtimeSync;
}
