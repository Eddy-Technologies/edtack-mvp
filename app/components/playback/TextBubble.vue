<template>
  <div
    :class="[
      'flex items-start gap-2 transition-opacity duration-300',
      isUser ? 'flex-row-reverse ml-auto' : ''
    ]"
  >
    <div class="w-8 h-8 flex-shrink-0">
      <img
        v-if="isUser"
        src="https://avatar.iran.liara.run/public"
        alt="User"
        class="w-full h-full rounded-full object-cover"
      >
    </div>
    <div
      :class="[
        'whitespace-pre-wrap transition-all duration-300 ease-out',
        isUser ? 'bg-green-100 p-2 rounded-xl max-w-[80%]' : 'max-w-[80%]'
      ]"
    >
      {{ displayedText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, onBeforeUnmount } from 'vue';

const props = defineProps<{
  text: string;
  isFirst: boolean;
  startPlayback: boolean;
  isUser: boolean;
}>();

const emit = defineEmits(['finish']);

const displayedText = ref('');
let intervalId: number | null = null;

watch(
  () => props.startPlayback,
  (start) => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (start) {
      typeText();
    }
  },
  { immediate: true }
);

function typeText() {
  if (!props.text) {
    return;
  }
  displayedText.value = '';
  let i = 0;

  intervalId = window.setInterval(() => {
    displayedText.value += props.text[i];
    i++;

    if (i >= props.text.length && intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
      emit('finish');
    }
  }, 5);
}

onBeforeUnmount(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});
</script>
