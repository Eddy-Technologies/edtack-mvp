<template>
  <div
    class="flex flex-col gap-3 relative"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <!-- Drag overlay -->
    <div
      v-if="isDragging"
      class="absolute inset-0 bg-primary-50 border-2 border-dashed border-primary-400 rounded-xl z-20 flex items-center justify-center"
    >
      <div class="text-center">
        <Icon name="i-heroicons-arrow-up-tray" class="w-8 h-8 text-primary-500 mb-2" />
        <p class="text-primary-600 font-medium">Drop files here</p>
      </div>
    </div>

    <!-- Input container -->
    <div class="bg-white border border-gray-200 shadow-sm rounded-xl overflow-visible" data-tour="chat-input">
      <!-- File preview area -->
      <ChatFilePreviewArea
        :files="stagedFiles"
        :auto-removed="lastAutoRemoved"
        :replaced-duplicates="lastReplacedDuplicates"
        :validation-errors="validationErrors"
        @remove="removeFile"
        @retry="retryUpload"
        @clear="clearFiles"
        @dismiss-notification="handleDismissNotification"
      />
      <!-- Keyword hint and input -->
      <div class="p-4">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm text-gray-400">
            Use keywords <span class="font-medium text-primary">"lesson"</span> or
            <span class="font-medium text-secondary">"quiz"</span> to generate interactive content
          </p>
          <p v-if="userEducationInfo" class="text-sm text-gray-400 whitespace-nowrap ml-4">
            {{ userEducationInfo }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- File upload button (always visible) -->
          <ChatFileUploadButton
            :disabled="isUploading"
            class="flex-shrink-0"
            @files-selected="handleFilesSelected"
          />
          <UTextarea
            v-model="input"
            placeholder="How can I help you today?"
            :maxlength="1000"
            :rows="2"
            :autoresize="true"
            :resize="false"
            class="flex-1"
            style="max-height: 7.5rem; font-size: 16px;"
            textarea-class="text-gray-600 focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            @keydown.enter="handleEnterKey"
          />
          <button
            :class="[
              'p-3 rounded-lg transition-colors duration-200 flex items-center justify-center',
              isDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-blue-700 text-white'
            ]"
            :disabled="isDisabled"
            @click="emitMessage"
          >
            <Icon
              :name="isDisabled ? 'i-heroicons-arrow-path' : 'i-heroicons-paper-airplane'"
              :class="['w-5 h-5', isDisabled ? 'animate-spin text-white' : '']"
            />
          </button>
        </div>
        <!-- Feedback link (shows on all screens except xl+) -->
        <div class="flex xl:hidden justify-end mt-2">
          <NuxtLink
            to="/about?tab=feedback"
            class="inline-flex items-center gap-1 text-sm text-primary font-medium hover:text-primary-600 transition-colors"
          >
            <Icon name="i-heroicons-chat-bubble-left-ellipsis" class="w-4 h-4" />
            Send Feedback
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Suggestions - only show on new chat -->
    <div v-if="showSuggestions" :class="['flex flex-wrap gap-2 items-center', isMobile ? 'justify-center' : '']" data-tour="chat-suggestions">
      <!-- Browse Subjects button -->
      <button
        :class="[
          'text-white border border-gray-200 rounded-md transition-colors flex items-center',
          'bg-primary hover:bg-primary-400 active:bg-primary-500',
          isMobile ? 'p-2.5' : 'px-3 py-1.5 text-sm gap-1'
        ]"
        :title="isMobile ? 'Browse Subjects' : undefined"
        @click="emit('open-study-panel')"
      >
        <Icon name="i-lucide-book-open" class="w-5 h-5" />
        <template v-if="!isMobile">
          Browse Subjects
        </template>
      </button>

      <!-- Lesson Pill -->
      <button
        :class="[
          'bg-white text-primary border-2 border-primary rounded-md hover:bg-primary-50 transition-colors flex items-center',
          isMobile ? 'p-2.5' : 'px-3 py-1.5 text-sm gap-1'
        ]"
        :title="isMobile ? 'Give me a lesson on...' : undefined"
        @click="appendText('Give me a lesson on ')"
      >
        <Icon v-if="isMobile" name="i-lucide-book-open" class="w-5 h-5" />
        <span v-else>Give me a lesson on...</span>
      </button>

      <!-- Quiz Pill -->
      <button
        :class="[
          'bg-white text-primary border-2 border-primary rounded-md hover:bg-primary-50 transition-colors flex items-center',
          isMobile ? 'p-2.5' : 'px-3 py-1.5 text-sm gap-1'
        ]"
        :title="isMobile ? 'Quiz me on...' : undefined"
        @click="appendText('Quiz me on ')"
      >
        <Icon v-if="isMobile" name="i-lucide-clipboard-list" class="w-5 h-5" />
        <span v-else>Quiz me on...</span>
      </button>

      <!-- Homework (no dropdown) -->
      <button
        :class="[
          'bg-white text-primary border-2 border-primary rounded-md hover:bg-primary-50 transition-colors flex items-center justify-center',
          isMobile ? 'p-2.5' : 'px-3 py-1.5 text-sm'
        ]"
        :title="isMobile ? 'Help me with my schoolwork on...' : undefined"
        @click="appendText('Help me with my schoolwork on ')"
      >
        <Icon v-if="isMobile" name="i-lucide-life-buoy" class="w-5 h-5" />
        <span v-else>Help me with my schoolwork on...</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, toRef } from 'vue';
import { useTokenUsage } from '~/composables/useTokenUsage';
import { useResponsive } from '~/composables/useResponsive';
import { useFileUpload } from '~/composables/useFileUpload';
import { useMeStore } from '~/stores/me';

import type { MessageAttachment } from '~/types/fileUpload';

const { isMobile } = useResponsive();
const meStore = useMeStore();

const props = defineProps({
  showSuggestions: {
    type: Boolean,
    default: true,
  },
  subject: {
    type: String,
    default: 'GENERAL',
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
  threadId: {
    type: String,
    default: '',
  },
});

const emit = defineEmits<{
  (e: 'send', payload: { text: string; fileIds: string[]; pendingFiles?: File[]; fileAttachments?: MessageAttachment[] }): void;
  (e: 'dropdown-opened' | 'dropdown-closed' | 'open-study-panel'): void;
}>();
const input = ref('');
const toast = useToast();

// File upload
const threadIdRef = toRef(props, 'threadId');
const {
  stagedFiles,
  isUploading,
  isDragging,
  uploadedFileIds,
  lastAutoRemoved,
  lastReplacedDuplicates,
  addFiles,
  removeFile,
  clearFiles,
  clearAfterSend,
  uploadFiles,
  clearUploadFeedback,
  handleDragEnter,
  handleDragOver,
  handleDragLeave,
  handleDrop,
} = useFileUpload(threadIdRef);

// Local state for validation errors (from addFiles)
const validationErrors = ref<string[]>([]);

async function handleFilesSelected(files: File[]) {
  const result = await addFiles(files);
  if (result.errors.length > 0) {
    // Store errors for inline display instead of toast
    validationErrors.value = result.errors;
  }
}

function handleDismissNotification(type: 'autoRemoved' | 'replacedDuplicates' | 'validationErrors') {
  if (type === 'autoRemoved' || type === 'replacedDuplicates') {
    clearUploadFeedback();
  } else if (type === 'validationErrors') {
    validationErrors.value = [];
  }
}

async function retryUpload(fileId: string) {
  // Find the file and re-upload
  const file = stagedFiles.value.find((f: { id: string }) => f.id === fileId);
  if (file && file.status === 'error') {
    file.status = 'pending';
    file.error = undefined;
    // Only upload if we have a threadId, otherwise file stays pending until send
    if (props.threadId) {
      await uploadFiles();
    }
  }
}

// Education options for label mapping
const levelOptions = ref<Array<{ value: string; label: string }>>([]);
const syllabusOptions = ref<Array<{ value: string; label: string }>>([]);

// Computed property for user education info display
const userEducationInfo = computed(() => {
  const levelLabel = levelOptions.value.find((opt) => opt.value === meStore.level_type)?.label;
  const syllabusLabel = syllabusOptions.value.find((opt) => opt.value === meStore.syllabus_type)?.label;

  if (levelLabel && syllabusLabel) {
    return `${levelLabel} • ${syllabusLabel}`;
  }
  return '';
});

const isSending = ref(false);
const DEBOUNCE_MS = 2000; // 2 second cooldown to prevent spam

// Combined disabled state: local debounce OR parent processing state
// Disable send when: sending, processing response, or files are still uploading
const isDisabled = computed(() => isSending.value || props.isProcessing || isUploading.value);

const { isLimitExceeded, fetchTokenUsage } = useTokenUsage();

// Reset sending state (can be called by parent when response received)
const resetSendState = () => {
  isSending.value = false;
};

// Expose methods for parent component
defineExpose({ resetSendState });

onMounted(async () => {
  // Fetch education options for label mapping
  try {
    const [levelsResponse, syllabusResponse] = await Promise.all([
      $fetch('/api/options/levels'),
      $fetch('/api/options/syllabus')
    ]);
    levelOptions.value = levelsResponse.levels || [];
    syllabusOptions.value = syllabusResponse.syllabus || [];
  } catch (error) {
    console.error('Failed to fetch education options:', error);
  }
});

const handleEnterKey = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    return;
  }
  event.preventDefault();
  emitMessage();
};

const emitMessage = async () => {
  if (!input.value.trim() || isDisabled.value) return;

  // Check token limit - show toast if exceeded but allow action (soft limit)
  await fetchTokenUsage();

  if (isLimitExceeded.value) {
    toast.add({
      title: 'Token limit reached',
      description: 'You have exceeded your token limit for this billing period.',
      color: 'red',
      timeout: 5000
    });
  }

  // Set sending state to prevent spam clicks
  isSending.value = true;

  // Handle file upload based on whether we have a threadId
  let fileIds: string[] = [];
  let pendingFiles: File[] | undefined;

  console.log('[ChatInput] Sending message, stagedFiles:', stagedFiles.value.length, 'threadId:', props.threadId);

  if (stagedFiles.value.length > 0) {
    if (props.threadId) {
      // Existing chat - upload files first (or wait for ongoing upload)
      console.log('[ChatInput] Uploading files for existing chat...');

      // Wait for any ongoing uploads to complete
      const hasUploadingFiles = stagedFiles.value.some((f: { status: string }) => f.status === 'uploading');
      if (hasUploadingFiles) {
        console.log('[ChatInput] Waiting for ongoing upload to complete...');
        // Poll until upload completes (with timeout)
        const maxWait = 30000; // 30 seconds
        const startTime = Date.now();
        while (stagedFiles.value.some((f: { status: string }) => f.status === 'uploading')) {
          if (Date.now() - startTime > maxWait) {
            toast.add({
              title: 'Upload timeout',
              description: 'File upload is taking too long. Please try again.',
              color: 'red',
              timeout: 5000,
            });
            isSending.value = false;
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Upload any remaining pending files
      const uploadSuccess = await uploadFiles();
      console.log('[ChatInput] Upload result:', uploadSuccess, 'uploadedFileIds:', uploadedFileIds.value);
      if (!uploadSuccess) {
        toast.add({
          title: 'Upload failed',
          description: 'Some files failed to upload. Please retry or remove them.',
          color: 'red',
          timeout: 5000,
        });
        isSending.value = false;
        return;
      }
      fileIds = uploadedFileIds.value;
    } else {
      // New chat - pass files to parent for upload after thread creation
      console.log('[ChatInput] New chat - passing files to parent');
      pendingFiles = stagedFiles.value.map((f: { file: File }) => f.file);
    }
  }

  // Build file attachments metadata from successfully uploaded files
  const fileAttachments: MessageAttachment[] = stagedFiles.value
    .filter((f: { status: string; uploadedId?: string }) => f.status === 'uploaded' && f.uploadedId)
    .map((f: { uploadedId: string; name: string; size: number; type: string }) => ({
      id: f.uploadedId,
      name: f.name,
      size: f.size,
      type: f.type,
      uploadedAt: new Date().toISOString(),
    }));

  // Proceed with message (soft limit - always allow)
  console.log('[ChatInput] Emitting send with fileIds:', fileIds, 'fileAttachments:', fileAttachments.length);
  emit('send', { text: input.value, fileIds, pendingFiles, fileAttachments: fileAttachments.length > 0 ? fileAttachments : undefined });
  input.value = '';

  // Clear staged files from both local state and backend
  // Note: Files metadata is already saved with the message, so we delete from backend staging
  clearAfterSend();

  // Auto-reset after cooldown (in case parent doesn't call resetSendState)
  setTimeout(() => {
    isSending.value = false;
  }, DEBOUNCE_MS);
};

const appendText = (text: string) => {
  input.value = text;
};
</script>
