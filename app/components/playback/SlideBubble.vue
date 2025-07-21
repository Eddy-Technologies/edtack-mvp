<template>
  <div class="whitespace-pre-wrap flex-shrink min-w-0 text-left">
    <div class="p-20 bg-gray-100 rounded-lg shadow">
      <h2 class="text-lg font-semibold mb-2">
        {{ slide.part_label || slide.title }}
      </h2>
      <div v-html="cleanContent(slide.content)" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  slide: any;
  isUser: boolean;
}>();

function cleanContent(raw: string) {
  return raw.replace(/&&img&&\s*(https?:\/\/[^\s]+)\s*&&img&&/g, '[Image: $1]');
}
</script>
