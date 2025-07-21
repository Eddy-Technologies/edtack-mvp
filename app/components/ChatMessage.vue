<template>
  <div class="w-full flex px-4" :class="block.isUser ? 'justify-end' : 'justify-center'">
    <div
      class="flex gap-3 p-3 rounded-lg cursor-pointer select-none"
      :class="[
        block.isUser
          ? 'bg-green-100 text-gray-800 rounded-bl-none text-left max-w-[75%] w-auto items-center'
          : index === 0
            ? 'text-gray-800 text-center rounded-br-none hover:bg-yellow-50 max-w-[1000px] w-full box-border'
            : 'text-gray-800 text-left rounded-br-none hover:bg-yellow-50 max-w-[1000px] w-full box-border',
      ]"
      @click="togglePlay"
    >
      <img
        v-if="block.isUser"
        src="https://i.pravatar.cc/40"
        alt="User Avatar"
        class="w-8 h-8 rounded-full flex-shrink-0"
      />
      <!-- Text Message -->
      <TextBubble
        v-if="block.type === 'text'"
        :text="block.text"
        :is-user="block.isUser"
        :playable="block.playable"
      />

      <!-- Questions List -->
      <SlideBubble
        v-else-if="block.type === 'slides'"
        v-for="(slide, idx) in block.slides"
        :key="`slide-${idx}`"
        :slide="slide"
        :is-user="false"
      />

      <!-- Questions List -->
      <QuestionBubble
        v-else-if="block.type === 'questions'"
        v-for="(q, idx) in block.questions"
        :key="`question-${idx}`"
        :text="q"
        :is-user="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import TextBubble from '@/components/playback/TextBubble.vue';
import SlideBubble from '@/components/playback/SlideBubble.vue';
import QuestionBubble from '@/components/playback/QuestionBubble.vue';
import { onUnmounted, ref } from 'vue';

interface Slide {
  id?: string | number;
  part_label?: string;
  title?: string;
  content: string;
}

interface Block {
  type: 'text' | 'slides' | 'questions';
  text?: string;
  isUser?: boolean;
  playable?: boolean;
  slides?: Slide[];
  questions?: string[];
}

const props = defineProps<{ block: Block; index: number }>();
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
