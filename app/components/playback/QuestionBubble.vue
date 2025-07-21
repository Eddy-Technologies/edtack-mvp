<template>
  <div
    class="whitespace-pre-wrap flex-shrink min-w-0"
    :class="isFirst ? 'text-center' : 'text-left'"
  >
    {{ displayedText }}
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';

const props = defineProps<{
  text: string;
  isFirst: boolean;
  startPlayback: boolean;
}>();

const emit = defineEmits(['finish']);

const displayedText = ref('');
let intervalId: number | null = null;

function typeText() {
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

onBeforeUnmount(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});
</script>
