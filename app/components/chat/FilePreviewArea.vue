<template>
  <div
    v-if="files.length > 0 || hasNotifications"
    class="px-3 py-2 border-b border-gray-100 bg-gray-50/50"
  >
    <!-- Notifications for auto-removed/replaced files -->
    <div
      v-if="hasNotifications"
      class="flex flex-wrap items-center gap-2 mb-2 text-xs"
    >
      <!-- Auto-removed files notification -->
      <div
        v-if="autoRemoved.length > 0"
        class="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded-md"
      >
        <Icon name="i-heroicons-exclamation-triangle" class="w-3.5 h-3.5 flex-shrink-0" />
        <span>Removed oldest: {{ autoRemoved.join(', ') }}</span>
        <button
          class="ml-1 hover:text-amber-900"
          @click="$emit('dismissNotification', 'autoRemoved')"
        >
          <Icon name="i-heroicons-x-mark" class="w-3 h-3" />
        </button>
      </div>

      <!-- Replaced duplicates notification -->
      <div
        v-if="replacedDuplicates.length > 0"
        class="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md"
      >
        <Icon name="i-heroicons-arrow-path" class="w-3.5 h-3.5 flex-shrink-0" />
        <span>Replaced: {{ replacedDuplicates.join(', ') }}</span>
        <button
          class="ml-1 hover:text-blue-900"
          @click="$emit('dismissNotification', 'replacedDuplicates')"
        >
          <Icon name="i-heroicons-x-mark" class="w-3 h-3" />
        </button>
      </div>

      <!-- Validation errors notification -->
      <div
        v-if="validationErrors.length > 0"
        class="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 rounded-md"
      >
        <Icon name="i-heroicons-x-circle" class="w-3.5 h-3.5 flex-shrink-0" />
        <span>{{ validationErrors[0] }}</span>
        <button
          class="ml-1 hover:text-red-900"
          @click="$emit('dismissNotification', 'validationErrors')"
        >
          <Icon name="i-heroicons-x-mark" class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- File previews row -->
    <div
      v-if="files.length > 0"
      class="flex items-center gap-2"
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { StagedFile } from '~/types/fileUpload';

const props = defineProps<{
  files: StagedFile[];
  autoRemoved?: string[];
  replacedDuplicates?: string[];
  validationErrors?: string[];
}>();

defineEmits<{
  (e: 'remove' | 'retry', fileId: string): void;
  (e: 'clear'): void;
  (e: 'dismissNotification', type: 'autoRemoved' | 'replacedDuplicates' | 'validationErrors'): void;
}>();

const hasNotifications = computed(() =>
  (props.autoRemoved?.length || 0) > 0 ||
  (props.replacedDuplicates?.length || 0) > 0 ||
  (props.validationErrors?.length || 0) > 0
);
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
