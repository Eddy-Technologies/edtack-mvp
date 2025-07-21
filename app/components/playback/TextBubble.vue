<template>
  <div class="whitespace-pre-wrap flex-shrink min-w-0 text-left">
    {{ displayedText }}
  </div>
</template>

<script setup lang="ts">
import { watch, ref, onBeforeUnmount } from 'vue';

const props = defineProps<{
  text: string;
  isFirst: boolean;
  startPlayback: boolean;
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
