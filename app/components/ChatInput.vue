<template>
  <div class="bg-white border shadow-lg rounded-xl p-4">
    <div class="flex items-center gap-2">
      <input
        v-model="input"
        type="text"
        placeholder="Type something here"
        class="flex-1 p-3 border rounded-lg text-sm"
        @keydown.enter="emitMessage"
      />
      <Button
        icon="i-heroicons-arrow-right-20-solid"
        color="black"
        size="l"
        bold
        rounded
        hover
        extraClasses="p-2 rounded-full hover:bg-gray-800"
        @click="emitMessage"
      />
    </div>

    <div class="mt-2 flex flex-wrap gap-2 text-sm">
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

const suggestions = [
  'Attach a file or image',
  'Help me with my schoolwork',
  'Give me a quiz',
  'Mark my paper',
  'Explain my textbook',
];

const emitMessage = () => {
  if (!input.value.trim()) return;
  emit('send', input.value);
  input.value = '';
};

const sendSuggestion = (text: string) => {
  emit('send', text);
};
</script>
