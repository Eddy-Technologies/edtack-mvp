<template>
  <div
    class="bg-gray-100 text-gray-700 text-sm p-2 text-center border-b border-gray-300 flex justify-between items-center px-4"
  >
    <div class="flex items-center gap-3">
      <!-- Connection status -->
      <span v-if="wsChat" class="flex items-center gap-1">
        <span
          class="w-2 h-2 rounded-full"
          :class="connectionStatusClass"
        />
        <span class="text-xs" :class="connectionStatusTextClass">
          {{ connectionStatusText }}
        </span>
      </span>

      <!-- Queue indicator -->
      <span v-if="queueLength > 0" class="flex items-center gap-1 text-xs text-yellow-600">
        <Icon name="i-heroicons-queue-list" class="w-3 h-3" />
        {{ queueLength }} message{{ queueLength > 1 ? 's' : '' }} queued
      </span>
    </div>

    <div class="flex-1" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { useWebSocketChat } from '~/composables/useWebSocketChat';

interface Props {
  wsChat: ReturnType<typeof useWebSocketChat> | null;
  isWaitingForResponse: boolean;
  queueLength: number;
}

const props = defineProps<Props>();

// Connection status computed properties
const connectionStatusClass = computed(() => {
  if (!props.wsChat) return 'bg-gray-400';

  if (props.wsChat.isConnected) {
    if (props.wsChat.isWaitingForResponse || props.isWaitingForResponse) {
      return 'bg-blue-500 animate-pulse';
    }
    return 'bg-green-500';
  }
  if (props.wsChat.isConnecting) return 'bg-yellow-500 animate-pulse';
  if (props.wsChat.error) return 'bg-red-500';
  return 'bg-gray-400';
});

const connectionStatusText = computed(() => {
  if (!props.wsChat) return 'Not initialized';

  if (props.wsChat.isConnected) {
    if (props.wsChat.isWaitingForResponse || props.isWaitingForResponse) {
      return props.wsChat.responsePhase || 'Waiting for response...';
    }
    return 'Connected';
  }
  if (props.wsChat.isConnecting) return 'Connecting...';
  if (props.wsChat.error) return 'Connection failed';
  return 'Disconnected';
});

const connectionStatusTextClass = computed(() => {
  if (!props.wsChat) return 'text-gray-500';

  if (props.wsChat.isConnected) {
    if (props.wsChat.isWaitingForResponse || props.isWaitingForResponse) {
      return 'text-blue-600';
    }
    return 'text-green-600';
  }
  if (props.wsChat.isConnecting) return 'text-yellow-600';
  if (props.wsChat.error) return 'text-red-600';
  return 'text-gray-500';
});
</script>
