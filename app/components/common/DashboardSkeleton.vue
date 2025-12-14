<template>
  <div class="py-8">
    <!-- Cards Variant -->
    <div v-if="variant === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in count" :key="i" class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="animate-pulse bg-gray-200 rounded h-8 w-20 mb-2" />
        <div class="animate-pulse bg-gray-200 rounded h-4 w-24" />
      </div>
    </div>

    <!-- List Variant -->
    <div v-else-if="variant === 'list'" class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
      <div v-for="i in count" :key="i" class="p-4 flex items-center gap-4">
        <div class="animate-pulse bg-gray-200 rounded-full h-10 w-10 shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="animate-pulse bg-gray-200 rounded h-4 w-48" />
          <div class="animate-pulse bg-gray-200 rounded h-3 w-32" />
        </div>
        <div class="animate-pulse bg-gray-200 rounded h-4 w-16" />
      </div>
    </div>

    <!-- Grid Variant -->
    <div v-else-if="variant === 'grid'" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="i in count" :key="i" class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="animate-pulse bg-gray-200 rounded-lg h-32 w-full mb-3" />
        <div class="animate-pulse bg-gray-200 rounded h-4 w-3/4 mb-2" />
        <div class="animate-pulse bg-gray-200 rounded h-3 w-1/2" />
      </div>
    </div>

    <!-- Study Variant -->
    <div v-else-if="variant === 'study'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in count" :key="i" class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="animate-pulse bg-gray-200 rounded h-5 w-32 mb-2" />
        <div class="flex gap-3">
          <div class="animate-pulse bg-gray-200 rounded h-3 w-20" />
          <div class="animate-pulse bg-gray-200 rounded h-3 w-16" />
        </div>
      </div>
    </div>

    <!-- Default Variant -->
    <div v-else class="flex justify-center">
      <div class="space-y-3 w-64">
        <div class="animate-pulse bg-gray-200 rounded h-4 w-full" />
        <div class="animate-pulse bg-gray-200 rounded h-4 w-3/4" />
        <div class="animate-pulse bg-gray-200 rounded h-4 w-1/2" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'cards' | 'list' | 'grid' | 'study' | 'default';
  count?: number;
}>(), {
  variant: 'default',
  count: 3
});
</script>
