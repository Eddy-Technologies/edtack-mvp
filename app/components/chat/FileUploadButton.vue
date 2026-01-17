<template>
  <div class="relative">
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      multiple
      :accept="acceptAttribute"
      class="hidden"
      @change="handleFileSelect"
    >

    <!-- Upload button -->
    <button
      type="button"
      class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="disabled"
      :title="disabled ? 'Upload in progress...' : 'Attach files'"
      @click="openFilePicker"
    >
      <Icon
        name="i-heroicons-paper-clip"
        class="w-5 h-5"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FILE_UPLOAD_CONFIG } from '~/constants/fileUpload';

defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'files-selected', files: File[]): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const acceptAttribute = FILE_UPLOAD_CONFIG.ACCEPT_ATTRIBUTE;

function openFilePicker() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (files && files.length > 0) {
    emit('files-selected', Array.from(files));
  }

  // Reset input so same file can be selected again
  input.value = '';
}
</script>
