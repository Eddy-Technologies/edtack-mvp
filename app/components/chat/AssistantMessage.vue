<template>
  <div class="flex items-start gap-3">
    <div class="shrink-0">
      <UIcon name="i-heroicons-sparkles-20-solid" class="text-primary mt-1" />
    </div>
    <div ref="messageContent" class="prose dark:prose-invert max-w-full">
      <p v-for="(line, i) in parsedLines" :key="i">{{ line }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, watch, ref, computed } from 'vue';
import 'katex/dist/katex.min.css';
import { renderMath } from '../../utils/katexUtils.js';

const props = defineProps<{
  content: string;
  messageId: string;
}>();

const messageContent = ref<HTMLElement | null>(null);

const parsedLines = computed(() => {
  return props.content.split('\n').filter(Boolean);
});

let renderTimeout: ReturnType<typeof setTimeout> | null = null;

watch(() => props.content, async () => {
  if (renderTimeout) clearTimeout(renderTimeout);

  renderTimeout = setTimeout(async () => {
    await nextTick();
    if (messageContent.value) {
      renderMath(messageContent.value);
    }
  }, 300); // adjust delay as needed
});
</script>
