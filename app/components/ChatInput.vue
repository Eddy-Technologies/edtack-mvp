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
        class="p-3 bg-primary hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        @click="emitMessage"
      >
        <Icon name="i-heroicons-paper-airplane" class="w-5 h-5" />
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
      <button
        v-for="suggestion in suggestions"
        :key="suggestion"
        class="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
        @click="sendSuggestion(suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Button from '~/components/common/Button.vue';

const emit = defineEmits(['send']);
const input = ref('');

const autocomplete = [
  { key: 'lesson', pillDisplay: 'Give me a lesson on...', input: 'Give me a lesson on ' },
  { key: 'homework', pillDisplay: 'Help me with my schoolwork on...', input: 'Help me with my schoolwork on ' },
  { key: 'quiz', pillDisplay: 'Quiz me on...', input: 'Quiz me on ' }
];

// const suggestions = ['Give me a quiz', 'Mark my paper', 'Explain my textbook'];

const handleEnterKey = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    // Allow default behavior for Shift+Enter (new line)
    return;
  }

  // Prevent default for Enter only (send message)
  event.preventDefault();
  emitMessage();
};

const emitMessage = () => {
  if (!input.value.trim()) return;
  emit('send', input.value);
  input.value = '';
};

const sendSuggestion = (text: string) => {
  emit('send', text);
};

const appendText = (text: string) => {
  input.value = text;
};
</script>
