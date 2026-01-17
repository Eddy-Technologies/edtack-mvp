<template>
  <div
    v-if="files.length > 0"
    class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50/50"
  >
    <!-- Scrollable file previews -->
    <div class="flex-1 overflow-x-auto">
      <div class="flex items-center gap-2">
        <ChatFilePreviewItem
          v-for="file in files"
          :key="file.id"
          :file="file"
          @remove="$emit('remove', file.id)"
          @retry="$emit('retry', file.id)"
        />
      </div>
    </div>

    <!-- Clear all button (shown when multiple files) -->
    <button
      v-if="files.length > 1"
      class="flex-shrink-0 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
      @click="$emit('clear')"
    >
      Clear all
    </button>
  </div>
</template>

<script setup lang="ts">
import type { StagedFile } from '~/types/fileUpload';

defineProps<{
  files: StagedFile[];
}>();

defineEmits<{
  (e: 'remove' | 'retry', fileId: string): void;
  (e: 'clear'): void;
}>();
</script>

<style scoped>
/* Hide scrollbar but keep functionality */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}
</style>
