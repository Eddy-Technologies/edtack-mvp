<template>
  <div class="bg-white border shadow-lg rounded-xl p-4">
    <div class="flex items-start gap-2">
      <UTextarea
        v-model="input"
        placeholder="How can I help you today?"
        :maxlength="500"
        :rows="2"
        :autoresize="true"
        :resize="false"
        class="flex-1"
        style="max-height: 30vh; font-size: 16px;"
        textarea-class="text-gray-600 focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
        @keydown.enter="handleEnterKey"
      />
      <button
        :class="[
          'p-3 rounded-lg transition-colors duration-200',
          isSending
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary hover:bg-blue-700 text-white'
        ]"
        :disabled="isSending"
        @click="emitMessage"
      >
        <Icon
          :name="isSending ? 'i-heroicons-arrow-path' : 'i-heroicons-paper-airplane'"
          :class="['w-5 h-5', isSending ? 'animate-spin text-white' : '']"
        />
      </button>
    </div>

    <div class="mt-2 flex flex-wrap gap-2 text-sm justify-center">
      <button
        v-for="item in autocomplete"
        :key="item.key"
        class="px-3 py-1 rounded-full hover:bg-gray-100 border border-primary text-gray-500"
        @click="appendText(item.input)"
      >
        {{ item.pillDisplay }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useTokenUsage } from '~/composables/useTokenUsage';

const emit = defineEmits(['send']);
const input = ref('');
const toast = useToast();
const isSending = ref(false);
const DEBOUNCE_MS = 2000; // 2 second cooldown to prevent spam

const { isLimitExceeded, fetchTokenUsage } = useTokenUsage();

// Reset sending state (can be called by parent when response received)
const resetSendState = () => {
  isSending.value = false;
};

// Expose methods for parent component
defineExpose({ resetSendState });

const autocomplete = [
  { key: 'lesson', pillDisplay: 'Give me a lesson on...', input: 'Give me a lesson on ' },
  { key: 'homework', pillDisplay: 'Help me with my schoolwork on...', input: 'Help me with my schoolwork on ' },
  { key: 'quiz', pillDisplay: 'Quiz me on...', input: 'Quiz me on ' }
];

const handleEnterKey = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    return;
  }
  event.preventDefault();
  emitMessage();
};

const emitMessage = async () => {
  if (!input.value.trim() || isSending.value) return;

  // Check token limit - show toast if exceeded but allow action (soft limit)
  await fetchTokenUsage();

  if (isLimitExceeded.value) {
    toast.add({
      title: 'Token limit reached',
      description: 'You have exceeded your token limit for this billing period.',
      color: 'red',
      timeout: 5000
    });
  }

  // Set sending state to prevent spam clicks
  isSending.value = true;

  // Proceed with message (soft limit - always allow)
  emit('send', input.value);
  input.value = '';

  // Auto-reset after cooldown (in case parent doesn't call resetSendState)
  setTimeout(() => {
    isSending.value = false;
  }, DEBOUNCE_MS);
};

const appendText = (text: string) => {
  input.value = text;
};
</script>
