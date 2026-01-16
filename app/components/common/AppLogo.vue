<template>
  <img
    src="/logo.png"
    :class="sizeClasses"
    alt="StudyWithEddy Logo"
  >
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (val: string) => ['sm', 'md', 'lg', 'xl'].includes(val)
  }
});

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-20 h-20'
  };
  return sizes[props.size];
});
</script>
