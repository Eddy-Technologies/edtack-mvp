<template>
  <div class="flex items-start gap-3">
    <div class="shrink-0">
      <UIcon name="i-heroicons-sparkles-20-solid" class="text-primary-500 mt-1" />
    </div>
    <div class="prose dark:prose-invert max-w-full">
      <p v-for="(line, i) in parsedLines" :key="i">{{ line }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  content: string
  messageId: string
}>();

const parsedLines = computed(() => {
  return props.content.split('\n').filter(Boolean);
});
</script>
