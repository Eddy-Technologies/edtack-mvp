<template>
  <div v-if="attachments && attachments.length > 0" class="flex flex-wrap gap-2">
    <div
      v-for="file in attachments"
      :key="file.id"
      class="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-200 max-w-[180px]"
    >
      <!-- File type icon -->
      <div class="flex-shrink-0 w-6 h-6 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
        <Icon
          v-if="isImage(file.type)"
          name="i-heroicons-photo"
          class="w-4 h-4 text-blue-500"
        />
        <Icon
          v-else-if="isPdf(file.type)"
          name="i-heroicons-document-text"
          class="w-4 h-4 text-red-500"
        />
        <Icon
          v-else
          name="i-heroicons-document"
          class="w-4 h-4 text-gray-500"
        />
      </div>

      <!-- File info -->
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-gray-600 truncate" :title="file.name">
          {{ file.name }}
        </p>
        <p class="text-[10px] text-gray-400">
          {{ formatFileSize(file.size) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageAttachment } from '~/types/fileUpload';
import { formatFileSize, isImageType, isPdfType } from '~/constants/fileUpload';

defineProps<{
  attachments?: MessageAttachment[];
  threadId?: string;
}>();

// Check if file is an image
const isImage = (type: string) => isImageType(type);

// Check if file is a PDF
const isPdf = (type: string) => isPdfType(type);
</script>
