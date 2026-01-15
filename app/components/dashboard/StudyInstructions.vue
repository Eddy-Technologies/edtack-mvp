<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Header Toggle -->
    <button
      class="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-info" class="text-blue-500" size="20" />
        <span class="font-medium text-gray-800">{{ title }}</span>
      </div>
      <UIcon
        :name="isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="text-gray-400"
        size="20"
      />
    </button>

    <!-- Collapsible Content -->
    <div v-show="isExpanded" class="border-t border-gray-100 p-4">
      <div class="rounded-xl bg-slate-50 p-4">
        <ul class="text-sm text-slate-600 space-y-2">
          <li>Subjects are organised by chapters, and each chapter contains:</li>
          <li><Strong>Lessons</Strong>: MOE aligned slides to aid your learning in a particular chapter. </li>
          <li><Strong>Practice</Strong>: Generate questions to help reinforce your understanding. </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  variant?: 'study' | 'tasks';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'study'
});

const isExpanded = ref(false);

const title = computed(() => {
  return props.variant === 'tasks' ? 'How Tasks Work' : 'How Study Works';
});
</script>
