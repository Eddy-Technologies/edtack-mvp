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
        @remove="removeFile"
        @retry="retryUpload"
        @clear="clearFiles"
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
          <!-- File upload button (left side) -->
          <ChatFileUploadButton
            :disabled="isUploading"
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
        <!-- Feedback link (shows on sm-xl screens, hidden on xs and xl+) -->
        <div class="hidden sm:flex xl:hidden justify-end mt-2">
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
    <div v-if="showSuggestions" :class="['flex flex-wrap gap-2', isMobile ? 'justify-center' : '']" data-tour="chat-suggestions">
      <!-- Text Book button (for subject-specific characters) -->
      <button
        v-if="showStudyButton"
        :class="[
          'text-white border border-gray-200 rounded-xl transition-colors flex items-center',
          studyDropdownOpen ? 'bg-primary-600' : 'bg-primary hover:bg-primary-400 active:bg-primary-500',
          isCreatingLesson ? 'border-gray-300 text-gray-400 cursor-not-allowed' : '',
          isMobile ? 'p-2.5' : 'px-3 py-1.5 text-sm gap-1'
        ]"
        :disabled="isCreatingLesson"
        :title="isMobile ? 'Text Book' : undefined"
        @click="toggleStudyDropdown"
      >
        <Icon
          :name="isCreatingLesson ? 'i-heroicons-arrow-path' : 'i-lucide-book'"
          :class="['w-5 h-5', isCreatingLesson ? 'animate-spin' : '']"
        />
        <template v-if="!isMobile">
          Text Book
          <Icon name="i-heroicons-chevron-down" class="w-3 h-3" />
        </template>
      </button>

      <!-- Lesson Pill -->
      <button
        :class="[
          'bg-white text-primary border-2 border-primary rounded-xl hover:bg-primary-50 transition-colors flex items-center',
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
          'bg-white text-primary border-2 border-primary rounded-xl hover:bg-primary-50 transition-colors flex items-center',
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
          'bg-white text-primary border-2 border-primary rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center',
          isMobile ? 'p-2.5' : 'px-3 py-1.5 text-sm'
        ]"
        :title="isMobile ? 'Help me with my schoolwork on...' : undefined"
        @click="appendText('Help me with my schoolwork on ')"
      >
        <Icon v-if="isMobile" name="i-lucide-life-buoy" class="w-5 h-5" />
        <span v-else>Help me with my schoolwork on...</span>
      </button>
    </div>

    <!-- Text Book Dropdown Menu (for subject-specific characters) -->
    <div
      v-if="studyDropdownOpen && showStudyDropdown"
      ref="dropdownRef"
      class="absolute top-full left-0 right-0 mt-2 bg-white border border-primary-200 rounded-xl shadow-lg z-10"
      :style="{ maxHeight: `${maxDropdownHeight}px` }"
      @click.stop
    >
      <!-- Loading state -->
      <div v-if="chaptersLoading" class="px-4 py-8 text-center">
        <Icon name="i-heroicons-arrow-path" class="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
        <p class="text-sm text-gray-500">Loading chapters...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="chapters.length === 0" class="px-4 py-8 text-center">
        <p class="text-sm text-gray-500">No chapters available</p>
      </div>

      <!-- Chapters list -->
      <div v-else class="overflow-y-auto" :style="{ maxHeight: `${maxDropdownHeight}px` }">
        <button
          v-for="chapter in chapters"
          :key="chapter.value"
          class="w-full px-4 py-3 text-left hover:bg-primary-50 first:rounded-t-xl last:rounded-b-xl border-b border-primary-100 last:border-b-0 transition-colors"
          @click="selectStudyChapter(chapter)"
        >
          <div class="flex flex-col gap-1">
            <div class="text-sm font-medium text-gray-900">
              {{ chapter.label }}
              <span v-if="chapter.chapterNumber !== undefined" class="text-gray-500 font-normal">
                (Chapter {{ chapter.chapterNumber + 1 }})
              </span>
            </div>
            <p v-if="chapter.description" class="text-xs text-gray-500 line-clamp-2">
              {{ chapter.description }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watchEffect, watch, nextTick, toRef } from 'vue';
import { useTokenUsage } from '~/composables/useTokenUsage';
import { useResponsive } from '~/composables/useResponsive';
import { useChapters } from '~/composables/useChapters';
import { useFileUpload } from '~/composables/useFileUpload';
import { mapCharacterSubjectToChapterSubjectId } from '~/utils/subjectMapping';
import { useMeStore } from '~/stores/me';
import { useLessonStart } from '~/composables/useLessonStart';

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
  (e: 'send', payload: { text: string; fileIds: string[]; pendingFiles?: File[] }): void;
  (e: 'dropdown-opened' | 'dropdown-closed'): void;
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
  addFiles,
  removeFile,
  clearFiles,
  uploadFiles,
  handleDragEnter,
  handleDragOver,
  handleDragLeave,
  handleDrop,
} = useFileUpload(threadIdRef);

async function handleFilesSelected(files: File[]) {
  const result = await addFiles(files);
  if (result.errors.length > 0) {
    toast.add({
      title: 'File error',
      description: result.errors[0],
      color: 'red',
      timeout: 5000,
    });
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
const isDisabled = computed(() => isSending.value || props.isProcessing);

// Text Book button state
const studyDropdownOpen = ref(false);
const isCreatingLesson = ref(false);
const { startLesson } = useLessonStart();

// Dynamic dropdown height calculation
const dropdownRef = ref<HTMLElement | null>(null);
const maxDropdownHeight = ref<number>(400); // Default fallback

const calculateDropdownHeight = () => {
  if (!dropdownRef.value) return;

  const rect = dropdownRef.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - rect.top;

  // Reserve some padding (e.g., 20px from bottom)
  const padding = 20;
  const availableHeight = spaceBelow - padding;

  // Set minimum height (e.g., 200px) and maximum based on available space
  const minHeight = 200;
  maxDropdownHeight.value = Math.max(minHeight, Math.min(availableHeight, 600));
};

const { isLimitExceeded, fetchTokenUsage } = useTokenUsage();

// Reset sending state (can be called by parent when response received)
const resetSendState = () => {
  isSending.value = false;
};

// Expose methods for parent component
defineExpose({ resetSendState });

// Chapter management
const { fetchChaptersBySubject } = useChapters();
const chapters = ref<Array<{ value: string; label: string; description?: string; level: number; chapterNumber?: number }>>([]);
const chaptersLoading = ref(false);

// Text Book button visibility
const showStudyButton = computed(() => props.subject !== 'GENERAL');
const showStudyDropdown = computed(() =>
  props.subject !== 'GENERAL' && chapters.value.length > 0
);

// Fetch chapters when subject changes
watchEffect(async () => {
  // Map character subject to chapter subject_id
  const subjectId = mapCharacterSubjectToChapterSubjectId(props.subject);

  if (subjectId) {
    chaptersLoading.value = true;
    try {
      chapters.value = await fetchChaptersBySubject(subjectId);
    } catch (err) {
      console.error('Failed to load chapters:', err);
      chapters.value = [];
    } finally {
      chaptersLoading.value = false;
    }
  } else {
    // For subjects without chapter mapping (e.g., GENERAL), clear chapters
    chapters.value = [];
    chaptersLoading.value = false;
  }
});

// Watch for study dropdown open/close to calculate height
watch(studyDropdownOpen, (newValue) => {
  if (newValue) {
    // Wait for next tick to ensure dropdown is rendered
    nextTick(() => {
      calculateDropdownHeight();
    });
  }
});

// Text Book dropdown handlers
const toggleStudyDropdown = (event: MouseEvent) => {
  event.stopPropagation();
  const wasOpen = studyDropdownOpen.value;
  studyDropdownOpen.value = !wasOpen;

  // Emit events for parent to coordinate carousel collapse
  if (wasOpen) {
    emit('dropdown-closed');
  } else {
    emit('dropdown-opened');
  }
};

const closeStudyDropdown = () => {
  const wasOpen = studyDropdownOpen.value;
  studyDropdownOpen.value = false;
  if (wasOpen) {
    emit('dropdown-closed');
  }
};

const selectStudyChapter = async (chapter: { value: string; label: string; description?: string; level: number; chapterNumber?: number }) => {
  isCreatingLesson.value = true;
  closeStudyDropdown();

  try {
    // Map character subject to chapter subject_id for API
    const subjectId = mapCharacterSubjectToChapterSubjectId(props.subject);

    if (!subjectId) {
      throw new Error('Invalid subject mapping');
    }

    // Use character subject as display name
    const subjectDisplayName = props.subject;

    await startLesson({
      chapterName: chapter.value,
      chapterDisplayName: chapter.label,
      subject: subjectId,
      subjectDisplayName
    });
  } catch (error) {
    console.error('Error selecting study chapter:', error);
  } finally {
    isCreatingLesson.value = false;
  }
};

// Click outside handler
const handleClickOutside = () => {
  closeStudyDropdown();
};

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', calculateDropdownHeight);

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

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', calculateDropdownHeight);
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

  if (stagedFiles.value.length > 0) {
    if (props.threadId) {
      // Existing chat - upload files first
      const uploadSuccess = await uploadFiles();
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
      pendingFiles = stagedFiles.value.map((f: { file: File }) => f.file);
    }
  }

  // Proceed with message (soft limit - always allow)
  emit('send', { text: input.value, fileIds, pendingFiles });
  input.value = '';

  // Clear files after successful send
  clearFiles();

  // Auto-reset after cooldown (in case parent doesn't call resetSendState)
  setTimeout(() => {
    isSending.value = false;
  }, DEBOUNCE_MS);
};

const appendText = (text: string) => {
  input.value = text;
};
</script>
