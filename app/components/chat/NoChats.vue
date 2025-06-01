<template>
  <div class="text-center text-gray-500 space-y-4">
    <div class="flex flex-wrap gap-2 justify-center">
      <UButton
        v-for="query in queries"
        :key="query"
        class="bg-background"
        variant="soft"
        @click="$emit('query-select', query)"
      >
        {{ query }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['query-select']);

const queries = ['Please explain it in another way', 'Help me understand this better'];
</script>
