<template>
  <div
    :class="[
      'flex-shrink-0 flex items-center justify-between gap-3 px-4 py-2 text-sm',
      isLimited
        ? 'bg-yellow-50 border-b border-yellow-200 text-yellow-800'
        : 'bg-blue-50 border-b border-blue-200 text-blue-800',
    ]"
  >
    <div class="flex items-center gap-2">
      <UIcon
        :name="isLimited ? 'i-lucide-clock' : 'i-lucide-info'"
        class="w-4 h-4 flex-shrink-0"
      />
      <span v-if="isLimited">
        Daily limit reached. Resets at {{ resetTime || 'midnight' }}.
      </span>
      <span v-else>
        {{ remaining }} message{{ remaining === 1 ? '' : 's' }} remaining today.
      </span>
    </div>
    <button
      class="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-lg transition-colors"
      :class="[
        isLimited
          ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-900'
          : 'bg-blue-100 hover:bg-blue-200 text-blue-900',
      ]"
      @click="$emit('signup')"
    >
      Sign up for more
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  remaining: number;
  resetTime: string | null;
  isLimited: boolean;
}>();

defineEmits<{
  signup: [];
}>();
</script>
