<template>
  <div
    class="relative group flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
    :class="{
      'border-red-300 bg-red-50': file.status === 'error',
      'border-primary-300': file.status === 'uploaded',
    }"
  >
    <!-- Image preview -->
    <img
      v-if="isImage && file.preview"
      :src="file.preview"
      :alt="file.name"
      class="w-full h-full object-cover"
    >

    <!-- PDF/Document icon -->
    <div
      v-else
      class="w-full h-full flex flex-col items-center justify-center p-2"
    >
      <Icon
        :name="fileIcon"
        class="w-8 h-8 text-gray-400"
      />
      <span class="text-[10px] text-gray-500 mt-1 truncate w-full text-center">
        {{ fileExtension }}
      </span>
    </div>

    <!-- Upload progress overlay -->
    <div
      v-if="file.status === 'uploading'"
      class="absolute inset-0 bg-black/40 flex items-center justify-center"
    >
      <Icon
        name="i-heroicons-arrow-path"
        class="w-6 h-6 text-white animate-spin"
      />
    </div>

    <!-- Error overlay -->
    <div
      v-if="file.status === 'error'"
      class="absolute inset-0 bg-red-500/20 flex items-center justify-center cursor-pointer"
      @click="$emit('retry')"
    >
      <div class="text-center">
        <Icon
          name="i-heroicons-exclamation-circle"
          class="w-5 h-5 text-red-600"
        />
        <span class="text-[9px] text-red-600 block mt-0.5">Retry</span>
      </div>
    </div>

    <!-- Uploaded checkmark -->
    <div
      v-if="file.status === 'uploaded'"
      class="absolute top-1 right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center"
    >
      <Icon
        name="i-heroicons-check"
        class="w-3 h-3 text-white"
      />
    </div>

    <!-- Remove button (shown on hover) -->
    <button
      class="absolute top-1 left-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      :class="{ 'opacity-100': file.status === 'error' }"
      @click.stop="$emit('remove')"
    >
      <Icon
        name="i-heroicons-x-mark"
        class="w-3 h-3 text-white"
      />
    </button>

    <!-- File name tooltip on hover -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <span class="text-[9px] text-white truncate block">
        {{ file.name }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { StagedFile } from '~/types/fileUpload';
import { isImageType, isPdfType } from '~/constants/fileUpload';

const props = defineProps<{
  file: StagedFile;
}>();

defineEmits<{
  (e: 'remove' | 'retry'): void;
}>();

const isImage = computed(() => isImageType(props.file.type));

const fileIcon = computed(() => {
  if (isPdfType(props.file.type)) {
    return 'i-heroicons-document-text';
  }
  if (props.file.type.startsWith('text/')) {
    return 'i-heroicons-document-text';
  }
  return 'i-heroicons-document';
});

const fileExtension = computed(() => {
  const parts = props.file.name.split('.');
  return parts.length > 1 ? `.${parts.pop()?.toUpperCase()}` : '';
});
</script>
