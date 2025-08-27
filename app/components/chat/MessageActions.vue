<template>
  <div class="flex items-center gap-1 mt-2 transition-opacity duration-200">
    <!-- Copy Button -->
    <button
      class="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
      title="Copy to clipboard"
      @click="handleCopy"
    >
      <Icon name="i-heroicons-clipboard" class="w-4 h-4" />
    </button>

    <!-- Like Button -->
    <button
      class="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
      title="Like this message"
      @click="handleLike"
    >
      <Icon name="i-heroicons-hand-thumb-up" class="w-4 h-4" />
    </button>

    <!-- Dislike Button -->
    <button
      class="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
      title="Dislike this message"
      @click="handleDislike"
    >
      <Icon name="i-heroicons-hand-thumb-down" class="w-4 h-4" />
    </button>

    <!-- TODO: Retry/Regenerate Button -->
    <!-- <button
      class="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
      title="Regenerate response"
      @click="handleRetry"
    >
      <Icon name="i-heroicons-arrow-path" class="w-4 h-4" />
    </button> -->

    <!-- TODO: Read/TTS Button -->
    <!-- <button
      class="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
      title="Read message aloud"
      @click="handleRead"
    >
      <Icon name="i-heroicons-speaker-wave" class="w-4 h-4" />
    </button> -->
  </div>
</template>

<script setup lang="ts">
import { useToast } from '#imports';
import { useCharacters } from '~/composables/useCharacters';

const props = defineProps<{
  messageText: string;
}>();

const toast = useToast();
const { startAvatarPlayback } = useCharacters();

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.messageText);
    toast.add({
      title: 'Copied',
      description: 'Message copied to clipboard',
      icon: 'i-heroicons-clipboard',
      timeout: 2000
    });
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to copy to clipboard',
      icon: 'i-heroicons-exclamation-triangle',
      timeout: 3000
    });
  }
};

const handleLike = () => {
  toast.add({
    title: 'Liked',
    description: 'Message liked',
    icon: 'i-heroicons-hand-thumb-up',
    timeout: 2000
  });
};

const handleDislike = () => {
  toast.add({
    title: 'Disliked',
    description: 'Message disliked',
    icon: 'i-heroicons-hand-thumb-down',
    timeout: 2000
  });
};

const handleRetry = () => {
  toast.add({
    title: 'Regenerating',
    description: 'Regenerating response...',
    icon: 'i-heroicons-arrow-path',
    timeout: 2000
  });
};

const handleRead = () => {
  // Start avatar animation for 3 seconds (3000ms)
  // TODO: when implement tts then remove timeout
  startAvatarPlayback(3000);

  toast.add({
    title: 'Reading',
    description: 'Reading message aloud...',
    icon: 'i-heroicons-speaker-wave',
    timeout: 2000
  });
};
</script>
