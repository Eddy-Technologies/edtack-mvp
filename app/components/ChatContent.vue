<template>
  <div class="flex flex-col h-full w-full bg-white overflow-hidden">
    <div ref="scrollArea" class="flex-1 overflow-y-auto p-6 space-y-4">
      <PlaybackBubble
        v-for="(msg, index) in messages"
        :key="index"
        :text="msg.text"
        :is-user="msg.isUser"
        :playable="msg.playable"
      />
      <div ref="bottomAnchor" />
    </div>

    <div class="sticky bg-white p-10 z-10 flex flex-col items-center gap-4">
      <div class="flex gap-4">
        <button
          :disabled="isLoadingTTS || !isPlayingAllowed || (!isSpeaking && !hasAssistantMessages)"
          class="px-4 py-2 text-white rounded-lg disabled:opacity-50"
          :class="{
            'bg-blue-500 hover:bg-blue-600': !isSpeaking && !isLoadingTTS,
            'bg-yellow-500 hover:bg-yellow-600': isSpeaking,
            'bg-gray-400': isLoadingTTS,
          }"
          @click="togglePlayback"
        >
          <span v-if="isLoadingTTS">Loading Audio...</span>
          <span v-else-if="isSpeaking">Pause Speech</span>
          <span v-else>Play Last Response</span>
        </button>

        <button
          :disabled="!isSpeaking && !isLoadingTTS"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          @click="stopAudio"
        >
          Stop Speech
        </button>
      </div>
      <ChatInput @send="handleSend" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onUnmounted } from 'vue';
import ChatInput from './ChatInput.vue';
import { useChat } from '~/composables/useChat.ts';
import { useSpeech } from '~/composables/useSpeech.ts';
import PlaybackBubble from './PlaybackBubble.vue';

interface ChatMessage {
  text: string;
  isUser: boolean;
  playable: boolean;
}

const scrollArea = ref<HTMLElement | null>(null);
const bottomAnchor = ref<HTMLElement | null>(null);

const messages = ref<ChatMessage[]>([
  { text: 'Talk to Snorlax...', isUser: false, playable: false },
]);
const conversationSummary = ref('Snorlax is a sleepy Pokémon who loves naps.');
const MAX_CONTEXT_MESSAGES = 6;

const isPlayingAllowed = ref(false); // whether play button can be pressed

// Destructure and add onSpeechEnd
const {
  isSpeaking,
  isLoadingTTS,
  speakLastAssistantMessage,
  stopSpeaking,
  toggleAudioPlayer,
  onSpeechEnd,
} = useSpeech();

const hasAssistantMessages = computed(() => messages.value.some((m) => !m.isUser));

const handleSend = async (text: string) => {
  stopSpeaking();
  isPlayingAllowed.value = false;

  messages.value.push({ text, isUser: true });
  messages.value.push({ text: '', isUser: false }); // placeholder for assistant

  const recentMessages = messages.value.slice(-MAX_CONTEXT_MESSAGES).map((m) => ({
    role: m.isUser ? 'user' : 'assistant',
    content: m.text,
  }));

  const messagesForApi = [
    {
      role: 'system',
      content: `You are a helpful assistant. Remember this context summary:\n${conversationSummary.value}`,
    },
    ...recentMessages,
  ];

  try {
    const { message, updatedSummary } = await useChat('/api/chat', {
      messages: messagesForApi,
      currentSummary: conversationSummary.value,
    });

    // Replace placeholder with real message
    messages.value[messages.value.length - 1] = {
      text: message,
      isUser: false,
    };

    if (updatedSummary) conversationSummary.value = updatedSummary;

    await nextTick();
    bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });

    // Speak the last assistant message and wait for end
    await speakLastAssistantMessage(messages.value);

    // Wait for speech to fully finish
    await new Promise<void>((resolve) => {
      onSpeechEnd(() => {
        isPlayingAllowed.value = true; // enable play button after speech ends
        resolve();
      });
    });
  } catch (err) {
    messages.value[messages.value.length - 1] = {
      text: '[Error getting response]',
      isUser: false,
    };
    await nextTick();
    bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
    isPlayingAllowed.value = true; // enable play button even on error
    console.error('Chat API error:', err);
  }
};

const togglePlayback = () => {
  if (!isPlayingAllowed.value) return; // prevent toggling while loading/playing first speech
  toggleAudioPlayer();
};

const stopAudio = () => {
  stopSpeaking();
  isPlayingAllowed.value = true;
};

watch(
  () => messages.value.length,
  async (newLen, oldLen) => {
    if (newLen > oldLen) {
      await nextTick();
      bottomAnchor.value?.scrollIntoView({ behavior: 'smooth' });
    }
  }
);

onUnmounted(() => {
  stopSpeaking();
});
</script>
