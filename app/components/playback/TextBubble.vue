<template>
  <div
    class="whitespace-pre-wrap flex-shrink min-w-0"
    :class="isFirst ? 'text-center' : 'text-left'"
  >
    <template v-if="isLoading">
      <!-- spinner svg -->
    </template>
    <template v-else>
      {{ text }}
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string;
  isFirst: boolean;
  isLoading: boolean;
}>();
</script>
