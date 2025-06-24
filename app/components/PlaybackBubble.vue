<template>
  <div class="w-full flex" :class="isUser ? 'justify-end' : 'justify-center'">
    <div
      @click="togglePlay"
      class="flex items-center gap-3 p-3 rounded-lg max-w-[75%] cursor-pointer select-none"
      :class="[
        isUser
          ? 'bg-green-100 text-gray-800 rounded-bl-none text-left'
          : isPlaying
            ? 'bg-yellow-100 text-gray-900 border border-yellow-300 shadow-md text-center rounded-br-none'
            : 'text-gray-800 text-center rounded-br-none hover:bg-yellow-50',
      ]"
    >
      <!-- Avatar inside bubble for user -->
      <img
        v-if="isUser"
        src="https://i.pravatar.cc/40"
        alt="User Avatar"
        class="w-8 h-8 rounded-full flex-shrink-0"
      />

      <!-- Message text -->
      <div class="whitespace-pre-wrap text-left flex-1">
        <template v-if="isLoading">
          <svg
            class="w-4 h-4 animate-spin text-gray-600 inline-block"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </template>
        <template v-else>
          {{ text }}
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

const props = defineProps<{
  text: string;
  isUser: boolean;
  playable: boolean;
}>();

const isPlaying = ref(false);
const isLoading = ref(false);
const audio = ref<HTMLAudioElement | null>(null);

// Stop all other audios when a new one starts
const GLOBAL_AUDIO_MANAGER = {
  currentAudio: null as HTMLAudioElement | null,
  stopCurrent() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  },
};

const togglePlay = async () => {
  if (!props.playable) {
    return;
  }
  if (isPlaying.value) {
    audio.value?.pause();
    isPlaying.value = false;
    return;
  }

  // Stop others before playing
  GLOBAL_AUDIO_MANAGER.stopCurrent();
  isLoading.value = true;

  try {
    if (!audio.value) {
      const response = await fetch('/api/synthesise-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: props.text }),
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      audio.value = new Audio(url);
      audio.value.onended = () => {
        isPlaying.value = false;
        GLOBAL_AUDIO_MANAGER.currentAudio = null;
      };
    }

    GLOBAL_AUDIO_MANAGER.currentAudio = audio.value;
    await audio.value.play();
    isPlaying.value = true;
  } catch (err) {
    console.error('Audio playback failed:', err);
  } finally {
    isLoading.value = false;
  }
};

onUnmounted(() => {
  if (audio.value) {
    audio.value.pause();
    audio.value.src = '';
  }
});
</script>
