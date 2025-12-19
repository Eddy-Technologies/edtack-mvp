<template>
  <div class="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-gray-200">
    <div class="flex items-center gap-3">
      <!-- Animated character icon or dots -->
      <div class="flex items-center gap-2">
        <!-- Character-specific icon if available -->
        <div v-if="character?.slug === 'eddy'" class="text-xl animate-pulse">
          🦁
        </div>
        <div v-else-if="character?.slug === 'mia'" class="text-xl animate-pulse">
          🦊
        </div>
        <div v-else class="flex space-x-1">
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms" />
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms" />
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms" />
        </div>
      </div>

      <!-- Dynamic loading message -->
      <span class="text-gray-600 text-sm">
        {{ currentMessage }}
      </span>
    </div>

    <!-- Cancel button -->
    <button
      class="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
      @click="$emit('cancel')"
    >
      <UIcon name="i-lucide-stop-circle" class="w-4 h-4" />
      <span>Stop</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';

const props = defineProps<{
  character?: any;
  isLoading: boolean;
  customMessages?: string[];
}>();

defineEmits<{
  (e: 'cancel'): void;
}>();

// Character-specific loading messages
const loadingMessages = computed(() => {
  if (props.customMessages?.length) {
    return props.customMessages;
  }

  const character = props.character?.slug || 'default';

  const messages: Record<string, string[]> = {
    eddy: [
      '🦁 Roaring up some knowledge...',
      'Hunting for the perfect answer...',
      'Prowling through my wisdom...',
      'Sharpening my educational claws...',
      'Gathering the pride\'s best insights...',
      'Stretching my teaching muscles...',
      'Mane-taining focus on your question...',
      'Leading the learning safari...'
    ],
    mia: [
      '🦊 Crafting a clever response...',
      'Thinking outside the fox hole...',
      'Connecting the mathematical dots...',
      'Brewing up some wisdom tea...',
      'Calculating the perfect explanation...',
      'Gathering forest knowledge...',
      'Foxing around with numbers...'
    ],
    default: [
      '🧠 Thinking deeply about this...',
      '📚 Consulting my knowledge base...',
      '✨ Formulating the perfect response...',
      '🔍 Processing your interesting question...',
      '🎯 Searching for the best explanation...',
      '🎨 Crafting an educational moment...',
      '🔗 Connecting the learning dots...',
      '💡 Illuminating the answer...'
    ]
  };

  return messages[character] || messages.default;
});

// Message rotation logic
const currentMessageIndex = ref(0);
const currentMessage = ref('');
let messageInterval: NodeJS.Timeout | null = null;

// Start/stop message rotation based on loading state
watch(() => props.isLoading, (loading) => {
  if (loading) {
    // Reset and start rotation
    currentMessageIndex.value = 0;
    currentMessage.value = loadingMessages.value[0];

    // Rotate messages every 2.5 seconds
    messageInterval = setInterval(() => {
      currentMessageIndex.value = (currentMessageIndex.value + 1) % loadingMessages.value.length;
      currentMessage.value = loadingMessages.value[currentMessageIndex.value];
    }, 2500);
  } else {
    // Stop rotation
    if (messageInterval) {
      clearInterval(messageInterval);
      messageInterval = null;
    }
  }
}, { immediate: true });

// Cleanup on unmount
onUnmounted(() => {
  if (messageInterval) {
    clearInterval(messageInterval);
  }
});
</script>

<style scoped>
/* Optional: Add custom animations if needed */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer {
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
</style>
