<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Create New Task</h2>
          <button
            class="text-gray-400 hover:text-gray-600 transition-colors"
            @click="$emit('close')"
          >
            <UIcon name="i-lucide-x" size="24" />
          </button>
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit.prevent="createTask">
          <!-- Child Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Assign to Child *
            </label>
            <USelect
              v-model="form.assigneeUserInfoId"
              :options="childrenOptions"
              placeholder="Select a child"
              :disabled="isSubmitting"
              required
            />
          </div>

          <!-- Subject Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <div v-if="isLoadingSubjects" class="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              <span class="text-gray-500 text-sm">Loading subjects...</span>
            </div>
            <USelect
              v-else
              v-model="form.subject"
              :options="subjects"
              placeholder="Select a subject"
              :disabled="isSubmitting"
              required
            />
          </div>

          <!-- Chapter Selection -->
          <div v-if="form.subject">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Chapters *
            </label>

            <!-- Loading State -->
            <div v-if="isLoadingChapters" class="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              <span class="text-gray-500 text-sm">Loading chapters...</span>
            </div>

            <!-- Chip-based Selection -->
            <div v-else class="space-y-3">
              <!-- Selected Chapters Display -->
              <div class="min-h-[60px] p-3 border border-gray-300 rounded-lg bg-gray-50">
                <div v-if="form.chapters?.length" class="flex flex-wrap gap-2">
                  <div
                    v-for="chapterValue in form.chapters"
                    :key="chapterValue"
                    class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-150 transition-colors"
                  >
                    <span>{{ getChapterDisplayName(chapterValue) }}</span>
                    <button
                      type="button"
                      class="ml-2 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-600 hover:bg-blue-200 hover:text-blue-800 focus:outline-none focus:bg-blue-200 focus:text-blue-800"
                      @click="removeChapter(chapterValue)"
                    >
                      <UIcon name="i-lucide-x" class="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div v-else class="text-gray-500 text-sm py-2">
                  No chapters selected
                </div>
              </div>

              <!-- Chapter List and Controls -->
              <div class="space-y-2">
                <!-- Toggle and Bulk Actions -->
                <div class="flex items-center justify-between">
                  <button
                    type="button"
                    class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    @click="showChapterList = !showChapterList"
                  >
                    {{ showChapterList ? 'Hide' : 'Show' }} available chapters
                    <UIcon
                      :name="showChapterList ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                      class="ml-1 h-4 w-4"
                    />
                  </button>
                  <div v-if="showChapterList" class="flex space-x-2">
                    <button
                      type="button"
                      class="text-xs px-2 py-1 text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                      @click="selectAllChapters"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      class="text-xs px-2 py-1 text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                      @click="clearAllChapters"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <!-- Chapter List -->
                <div v-if="showChapterList" class="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  <div
                    v-for="chapter in chapterOptions"
                    :key="chapter.value"
                    class="flex items-center p-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      :id="`chapter-${chapter.value}`"
                      v-model="form.chapters"
                      type="checkbox"
                      :value="chapter.value"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    >
                    <label :for="`chapter-${chapter.value}`" class="ml-3 flex-1 cursor-pointer">
                      <div class="text-sm font-medium text-gray-900">{{ chapter.label }}</div>
                      <div v-if="chapter.description" class="text-xs text-gray-500">{{ chapter.description }}</div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <p class="text-sm text-gray-500 mt-1">Select one or more chapters for this task</p>
          </div>

          <!-- Lesson Generation Type Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Task Type *
            </label>
            <USelect
              v-model="form.lessonGenerationType"
              :options="lessonGenerationTypeOptions"
              placeholder="Select generation type"
              :disabled="true"
              class="bg-gray-300 cursor-not-allowed"
              required
            />
            <p class="text-sm text-gray-500 mt-1">Currently, only quizzes are allowed be assigned as tasks to earn credits.</p>
          </div>

          <!-- Credits per Quiz -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Credits per Quiz *
            </label>
            <input
              v-model.number="form.creditsPerQuiz"
              type="number"
              min="1"
              :max="userBalance"
              step="1"
              pattern="[0-9]*"
              required
              placeholder="Enter credits per quiz"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p class="text-sm text-gray-500 mt-1">Amount of credits student will receive for completing each quiz</p>

            <!-- Credit Validation Display -->
            <div v-if="form.chapters?.length && form.creditsPerQuiz" class="mt-3 p-3 rounded-lg border" :class="creditValidation.valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'">
              <div class="flex items-start">
                <UIcon
                  :name="creditValidation.valid ? 'i-lucide-check-circle' : 'i-lucide-alert-triangle'"
                  :class="creditValidation.valid ? 'text-green-600' : 'text-yellow-600'"
                  class="w-4 h-4 mt-0.5 mr-2"
                />
                <div class="text-sm">
                  <p :class="creditValidation.valid ? 'text-green-800' : 'text-yellow-800'" class="font-medium">
                    {{ creditValidation.message }}
                  </p>
                  <p :class="creditValidation.valid ? 'text-green-700' : 'text-yellow-700'" class="mt-1">
                    {{ form.chapters.length }} chapters × {{ form.creditsPerQuiz }} credits = {{ totalCreditsNeeded }} total credits needed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Required Score for Credit -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Required Score for Credit *
            </label>
            <input
              v-model.number="form.requiredScore"
              type="number"
              min="0"
              max="100"
              required
              placeholder="70"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p class="text-sm text-gray-500 mt-1">Minimum score percentage (0-100) required to earn credit</p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>

          <!-- Actions -->
          <div class="flex space-x-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              text="Create Task"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            />
            <Button
              variant="secondary"
              text="Cancel"
              :disabled="isSubmitting"
              @clicked="$emit('close')"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import Button from '../../common/Button.vue';
import { LESSON_GENERATION_TYPE } from '~~/shared/constants';
import { useTask, type CreateTaskReq } from '~/composables/useTask';
import { useCredit } from '~/composables/useCredit';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close' | 'task-created'): void;
}>();

// Form state
const getInitialForm = () => {
  return {
    assigneeUserInfoId: '',
    subject: '',
    chapters: [] as string[],
    lessonGenerationType: LESSON_GENERATION_TYPE.QUIZ, // Default to QUIZ
    creditsPerQuiz: null as number | null,
    requiredScore: 80,
  };
};

const form = ref<CreateTaskReq>(getInitialForm());
const codesStore = useCodesStore();
const { balance: userBalance, refreshCredits } = useCredit();
const children = ref<any[]>([]);
const subjects = ref<any[]>([]);
const chapterOptions = ref<any[]>([]);
const isSubmitting = ref(false);
const isLoadingSubjects = ref(false);
const isLoadingChapters = ref(false);
const showChapterList = ref(false);
const error = ref<string | null>(null);

const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const childrenOptions = computed(() => {
  return children.value.map((child) => ({
    value: child.id,
    label: child.name
  }));
});

// Get options from codes store and API
const lessonGenerationTypeOptions = computed(() => codesStore.lessonGenerationTypes);

// Credit validation logic
const totalCreditsNeeded = computed(() => {
  if (!form.value.chapters?.length || !form.value.creditsPerQuiz) return 0;
  return form.value.chapters.length * form.value.creditsPerQuiz;
});

const creditValidation = computed(() => {
  if (!form.value.chapters?.length || !form.value.creditsPerQuiz) {
    return { valid: false, message: 'Select chapters and enter credits per quiz' };
  }

  const needed = totalCreditsNeeded.value;
  const available = userBalance.value;

  // Check if user has sufficient balance
  if (needed > available) {
    return {
      valid: false,
      message: `Insufficient balance! You have ${available} credits available, but need ${needed} credits.`
    };
  }

  return {
    valid: true,
    message: `Credit allocation looks good! You have ${available} credits available.`
  };
});

// Load children when modal opens
const loadChildren = async () => {
  try {
    const response = await $fetch('/api/children/list');
    if (response.success) {
      children.value = response.children || [];
    }
  } catch (err: any) {
    console.error('Failed to load children:', err);
    error.value = 'Failed to load children list';
  }
};

// Load subjects for selected child
const loadSubjectsForChild = async (childId: string) => {
  try {
    isLoadingSubjects.value = true;
    const response = await $fetch(`/api/curriculum/subjects/${childId}`);
    if (response.success) {
      subjects.value = response.subjects || [];
      // Reset subject selection when child changes
      form.value.subject = '';
      form.value.chapters = [];
      chapterOptions.value = [];
      showChapterList.value = false;
    }
  } catch (err: any) {
    console.error('Failed to load subjects for child:', err);
    subjects.value = [];
    form.value.subject = '';
    form.value.chapters = [];
    chapterOptions.value = [];
  } finally {
    isLoadingSubjects.value = false;
  }
};

// Load chapters for selected subject
const loadChaptersForSubject = async (subject: string) => {
  try {
    isLoadingChapters.value = true;
    const response = await $fetch(`/api/chapters/by-subject/${subject}`);
    if (response.success) {
      chapterOptions.value = response.chapters || [];
      // Select all chapters by default
      form.value.chapters = chapterOptions.value.map((chapter) => chapter.value);
      showChapterList.value = false;
    }
  } catch (err: any) {
    console.error('Failed to load chapters for subject:', err);
    chapterOptions.value = [];
    form.value.chapters = [];
  } finally {
    isLoadingChapters.value = false;
  }
};

// Helper methods for chip functionality
const getChapterDisplayName = (chapterValue: string) => {
  const chapter = chapterOptions.value.find((ch) => ch.value === chapterValue);
  return chapter ? chapter.label : chapterValue;
};

const removeChapter = (chapterValue: string) => {
  form.value.chapters = form.value.chapters.filter((ch) => ch !== chapterValue);
};

const selectAllChapters = () => {
  form.value.chapters = chapterOptions.value.map((chapter) => chapter.value);
};

const clearAllChapters = () => {
  form.value.chapters = [];
};

const { createTask: createTaskAPI } = useTask();

const createTask = async () => {
  try {
    isSubmitting.value = true;
    error.value = null;

    // Validate required fields
    if (!form.value.subject || !form.value.lessonGenerationType) {
      error.value = 'Please select both subject and generation type';
      return;
    }

    if (!form.value.chapters?.length) {
      error.value = 'Please select at least one chapter';
      return;
    }

    // Validate quiz fields
    if (form.value.requiredScore < 0 || form.value.requiredScore > 100) {
      error.value = 'Required score must be between 0 and 100';
      return;
    }

    if (!form.value.creditsPerQuiz || form.value.creditsPerQuiz < 1) {
      error.value = 'Credits per quiz must be at least 1';
      return;
    }

    // Validate credit allocation
    if (!creditValidation.value.valid) {
      error.value = creditValidation.value.message;
      return;
    }

    const response = await createTaskAPI(form.value as CreateTaskReq);

    if (response.success) {
      // Reset form
      form.value = getInitialForm();
      emit('task-created');
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to create task. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

// Load children when modal opens
onMounted(() => {
  if (props.isOpen) {
    loadChildren();
    refreshCredits();
  }
});

// Watch for modal open to load children and credits
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    loadChildren();
    refreshCredits();
    error.value = null;
  }
});

// Watch for child selection to load subjects
watch(() => form.value.assigneeUserInfoId, (newChildId) => {
  if (newChildId) {
    loadSubjectsForChild(newChildId);
  } else {
    subjects.value = [];
    form.value.subject = '';
    form.value.chapters = [];
    chapterOptions.value = [];
  }
});

// Watch for subject selection to load chapters
watch(() => form.value.subject, (newSubject) => {
  if (newSubject) {
    loadChaptersForSubject(newSubject);
  } else {
    chapterOptions.value = [];
    form.value.chapters = [];
  }
});
</script>
