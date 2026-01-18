<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-4 sm:p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">{{ modalTitle }}</h2>
          <button
            class="text-gray-400 hover:text-gray-600 transition-colors"
            @click="$emit('close')"
          >
            <UIcon name="i-lucide-x" size="24" />
          </button>
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <!-- Child Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Assign to Child *
            </label>
            <USelect
              v-model="form.assigneeUserInfoId"
              :options="childrenOptions"
              placeholder="Select a child"
              :disabled="isSubmitting || isFieldLocked('assigneeUserInfoId')"
              size="md"
              required
            />
            <p v-if="isFieldLocked('assigneeUserInfoId')" class="text-xs text-gray-500 mt-1">
              Cannot change assignee for existing task
            </p>
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
              :disabled="isSubmitting || isFieldLocked('subject')"
              size="md"
              required
            />
            <p v-if="isFieldLocked('subject')" class="text-xs text-gray-500 mt-1">
              Cannot change subject for existing task
            </p>
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
                    class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                    :class="isChapterAttempted(chapterValue) ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-150'"
                  >
                    <UIcon v-if="isChapterAttempted(chapterValue)" name="i-lucide-lock" class="w-3 h-3 mr-1" />
                    <span>{{ getChapterDisplayName(chapterValue) }}</span>
                    <button
                      v-if="!isChapterAttempted(chapterValue)"
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

              <!-- Edit Mode Warning -->
              <UAlert
                v-if="isEditMode && hasAttemptedChapters"
                color="yellow"
                icon="i-lucide-alert-triangle"
                title="Note"
                description="Chapters with a lock icon have been attempted and cannot be removed."
                class="text-sm"
              />

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
                  <div v-if="showChapterList && !isEditMode" class="flex space-x-2">
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
                      :disabled="isChapterAttempted(chapter.value)"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    <label :for="`chapter-${chapter.value}`" class="ml-3 flex-1 cursor-pointer">
                      <div class="flex items-center gap-2">
                        <div class="text-sm font-medium text-gray-900">{{ chapter.label }}</div>
                        <UIcon v-if="isChapterAttempted(chapter.value)" name="i-lucide-lock" class="w-3 h-3 text-yellow-600" />
                      </div>
                      <div v-if="chapter.description" class="text-xs text-gray-500">{{ chapter.description }}</div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <p class="text-sm text-gray-500 mt-1">
              {{ isEditMode ? 'You can add new chapters to this task' : 'Select one or more chapters for this task' }}
            </p>
          </div>

          <!-- Task Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Task Name *
            </label>
            <UInput
              v-model="form.name"
              placeholder="Enter task name (e.g., Biology Quiz Chapter 1-5)"
              :disabled="isSubmitting"
              size="md"
              required
            />
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
              size="md"
              class="bg-gray-100 cursor-not-allowed"
              required
            />
            <p class="text-sm text-gray-500 mt-1">Currently, only quizzes are allowed to be assigned as tasks to earn credits.</p>
          </div>

          <!-- Credits per Chapter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Credits per Chapter *
            </label>
            <UInput
              v-model.number="form.creditsPerChapter"
              type="number"
              min="0"
              :max="userBalance"
              step="1"
              pattern="[0-9]*"
              required
              placeholder="Enter credits per chapter"
              size="md"
            />
            <p class="text-sm text-gray-500 mt-1">Amount of credits student will receive for completing each chapter</p>

            <!-- Credit Validation Display -->
            <div v-if="form.chapters?.length && form.creditsPerChapter != null" class="mt-3 p-3 rounded-lg border" :class="creditValidation.valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'">
              <div class="flex items-start">
                <UIcon
                  :name="creditValidation.valid ? 'i-lucide-check-circle' : 'i-lucide-alert-triangle'"
                  :class="creditValidation.valid ? 'text-green-600' : 'text-yellow-600'"
                  class="w-4 h-4 mt-0.5 mr-2"
                />
                <div class="text-sm flex-1">
                  <p :class="creditValidation.valid ? 'text-green-800' : 'text-yellow-800'" class="font-medium">
                    {{ creditValidation.message }}
                  </p>
                  <p :class="creditValidation.valid ? 'text-green-700' : 'text-yellow-700'" class="mt-1">
                    {{ creditValidation.details }}
                  </p>
                  <Button
                    v-if="!creditValidation.valid"
                    variant="secondary"
                    size="sm"
                    icon="i-lucide-wallet"
                    text="Top Up Credits"
                    class="mt-2"
                    @clicked="goToCredits"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Required Score for Credit -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Required Score for Credit *
            </label>
            <UInput
              v-model.number="form.requiredScore"
              type="number"
              min="0"
              max="100"
              required
              placeholder="Enter score (e.g., 70)"
              size="md"
            />
            <p class="text-sm text-gray-500 mt-1">Minimum score percentage (0-100) required to earn credit. Use 0 to give credits upon attempt.</p>
          </div>

          <!-- Number of Questions -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions *
            </label>
            <UInput
              v-model.number="form.questionsPerQuiz"
              type="number"
              min="1"
              max="50"
              step="1"
              required
              placeholder="10"
              size="md"
            />
            <p class="text-sm text-gray-500 mt-1">Number of questions per quiz (1-50)</p>
          </div>

          <!-- Status (Edit Mode Only) -->
          <div v-if="isEditMode">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <USelect
              v-model="form.status"
              :options="[
                { label: 'Open', value: 'OPEN' },
                { label: 'Closed', value: 'CLOSED' }
              ]"
              size="md"
            />
            <p class="text-sm text-gray-500 mt-1">
              Closing a task prevents new quiz attempts
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ error }}</p>
            <Button
              v-if="isInsufficientBalanceError"
              variant="primary"
              size="sm"
              icon="i-lucide-wallet"
              text="Go to Credits"
              :disabled="isSubmitting"
              class="mt-3"
              @clicked="goToCredits"
            />
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              :text="submitButtonText"
              class="w-full sm:w-auto order-1"
              :loading="isSubmitting"
              :disabled="isSubmitting || !hasChanges"
            />
            <Button
              variant="secondary"
              text="Cancel"
              class="w-full sm:w-auto order-2"
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
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import Button from '../../common/Button.vue';
import { LESSON_GENERATION_TYPE } from '~~/shared/constants';
import { useTask, type CreateTaskReq } from '~/composables/useTask';
import { useCredit } from '~/composables/useCredit';
import { getDisplayFullName } from '~/utils/avatarUtils';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Chapter {
  id: string;
  displayName: string;
  completedAt: string | null;
}

interface Task {
  id: string;
  name: string;
  assigneeUserInfoId: string;
  subjectName: string;
  creditPerChapter: number;
  requiredScore: number;
  questionsPerQuiz: number;
  status: string;
  chapters: Chapter[];
  assigneeInfo?: {
    firstName: string;
    lastName: string;
  };
}

interface Props {
  isOpen: boolean;
  task?: Task | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close' | 'task-saved'): void;
}>();

// Mode detection
const isEditMode = computed(() => !!props.task);
const modalTitle = computed(() => isEditMode.value ? 'Edit Task' : 'Create New Task');
const submitButtonText = computed(() => isEditMode.value ? 'Save Changes' : 'Create Task');

// Form state
const getInitialForm = () => {
  if (props.task) {
    // Edit mode - pre-populate from task
    return {
      name: props.task.name,
      assigneeUserInfoId: props.task.assigneeUserInfoId,
      subject: props.task.subjectName,
      chapters: props.task.chapters.map((c) => c.id),
      lessonGenerationType: LESSON_GENERATION_TYPE.QUIZ,
      creditsPerChapter: props.task.creditPerChapter,
      requiredScore: props.task.requiredScore,
      questionsPerQuiz: props.task.questionsPerQuiz,
      status: props.task.status
    };
  } else {
    // Create mode - empty form
    return {
      name: '', // Will be set by watcher
      assigneeUserInfoId: '',
      subject: '',
      chapters: [] as string[],
      lessonGenerationType: LESSON_GENERATION_TYPE.QUIZ,
      creditsPerChapter: 100,
      requiredScore: 70,
      questionsPerQuiz: 10,
      status: 'OPEN'
    };
  }
};

const form = ref(getInitialForm());
const router = useRouter();
const codesStore = useCodesStore();
const { balance: userBalance, refreshCredits } = useCredit();
// Map chapter IDs to display names for edit mode
const taskChapterMap = ref<Map<string, string>>(new Map());
const children = ref<Child[]>([]);
const subjects = ref<any[]>([]);
const chapterOptions = ref<any[]>([]);
const isSubmitting = ref(false);
const isLoadingSubjects = ref(false);
const isLoadingChapters = ref(false);
const showChapterList = ref(false);
const error = ref<string | null>(null);
const initialFormData = ref<typeof form.value | null>(null);

// Field locking for edit mode
const isFieldLocked = (fieldName: string) => {
  if (!isEditMode.value) return false;
  return ['assigneeUserInfoId', 'subject', 'lessonGenerationType'].includes(fieldName);
};

// Original chapters tracking
const originalChapterIds = computed(() =>
  props.task?.chapters.map((c) => c.id) || []
);

// Check if chapter was attempted
const isChapterAttempted = (chapterId: string) => {
  if (!isEditMode.value) return false;
  const chapter = props.task?.chapters.find((c) => c.id === chapterId);
  return !!chapter?.completedAt;
};

const hasAttemptedChapters = computed(() =>
  props.task?.chapters.some((c) => c.completedAt) || false
);

// Change detection for edit mode
const hasChanges = computed(() => {
  // In create mode, always allow submission
  if (!isEditMode.value || !initialFormData.value) {
    return true;
  }

  const current = form.value;
  const initial = initialFormData.value;

  // Check simple fields
  if (current.name !== initial.name) return true;
  if (current.creditsPerChapter !== initial.creditsPerChapter) return true;
  if (current.requiredScore !== initial.requiredScore) return true;
  if (current.questionsPerQuiz !== initial.questionsPerQuiz) return true;
  if (current.status !== initial.status) return true;

  // Check chapters (compare sorted arrays)
  const currentChapters = [...current.chapters].sort();
  const initialChapters = [...initial.chapters].sort();

  if (currentChapters.length !== initialChapters.length) return true;

  for (let i = 0; i < currentChapters.length; i++) {
    if (currentChapters[i] !== initialChapters[i]) return true;
  }

  return false;
});

const childrenOptions = computed(() => {
  return children.value.map((child) => ({
    value: child.id,
    label: getDisplayFullName(child.firstName, child.lastName, child.email)
  }));
});

// Get options from codes store and API
const lessonGenerationTypeOptions = computed(() => codesStore.lessonGenerationTypes);

// Generate default task name from selected subject and lesson type
const defaultTaskName = computed(() => {
  if (!form.value.subject) {
    return 'New Task';
  }

  // Find the subject's display name
  const subject = subjects.value.find((s) => s.value === form.value.subject);
  if (!subject) {
    return 'New Task';
  }

  // Get the lesson generation type label
  const lessonType = lessonGenerationTypeOptions.value.find(
    (t) => t.value === form.value.lessonGenerationType
  );
  const typeLabel = lessonType?.label || 'Quiz';

  return `${subject.label} ${typeLabel}`;
});

// Credit validation logic
const totalCreditsNeeded = computed(() => {
  if (!form.value.chapters?.length || form.value.creditsPerChapter == null) return 0;

  if (isEditMode.value) {
    // Only count new chapters
    const newChapters = form.value.chapters.filter(
      (id) => !originalChapterIds.value.includes(id)
    );
    return newChapters.length * form.value.creditsPerChapter;
  } else {
    // Count all chapters
    return form.value.chapters.length * form.value.creditsPerChapter;
  }
});

const creditValidation = computed(() => {
  if (!form.value.chapters?.length || form.value.creditsPerChapter == null) {
    return {
      valid: false,
      message: 'Select chapters and enter credits per chapter',
      details: ''
    };
  }

  const needed = totalCreditsNeeded.value;
  const available = userBalance.value;

  if (isEditMode.value) {
    const newChaptersCount = form.value.chapters.filter(
      (id) => !originalChapterIds.value.includes(id)
    ).length;

    if (newChaptersCount === 0) {
      return {
        valid: true,
        message: 'No new chapters added',
        details: `Existing ${form.value.chapters.length} chapters already allocated.`
      };
    }

    if (needed > available) {
      return {
        valid: false,
        message: `Insufficient balance for ${newChaptersCount} new chapters!`,
        details: `You have ${available} credits available, but need ${needed} credits for new chapters.`
      };
    }

    return {
      valid: true,
      message: `Credit allocation for ${newChaptersCount} new chapters looks good!`,
      details: `${needed} credits needed for new chapters. You have ${available} credits available.`
    };
  } else {
    // Create mode
    if (needed > available) {
      return {
        valid: false,
        message: `Insufficient balance! You have ${available} credits available, but need ${needed} credits.`,
        details: `${form.value.chapters.length} chapters × ${form.value.creditsPerChapter} credits = ${needed} total credits needed`
      };
    }

    return {
      valid: true,
      message: `Credit allocation looks good! You have ${available} credits available.`,
      details: `${form.value.chapters.length} chapters × ${form.value.creditsPerChapter} credits = ${needed} total credits needed`
    };
  }
});

// Check if error is due to insufficient balance
const isInsufficientBalanceError = computed(() => {
  return error.value?.includes('Insufficient balance') ?? false;
});

// Auto-generate task name when subject changes (create mode only)
watch(
  () => form.value.subject,
  (newSubject) => {
    if (!isEditMode.value && newSubject) {
      form.value.name = defaultTaskName.value;
    }
  },
  { immediate: true }
);

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

      // In edit mode, don't reset subject
      if (!isEditMode.value) {
        form.value.subject = '';
        form.value.chapters = [];
        chapterOptions.value = [];
        showChapterList.value = false;
      }
    }
  } catch (err: any) {
    console.error('Failed to load subjects for child:', err);
    subjects.value = [];
    if (!isEditMode.value) {
      form.value.subject = '';
      form.value.chapters = [];
      chapterOptions.value = [];
    }
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

      // In create mode, select all chapters by default
      // In edit mode, keep existing selection
      if (!isEditMode.value) {
        form.value.chapters = chapterOptions.value.map((chapter) => chapter.value);
        showChapterList.value = false;
      }
    }
  } catch (err: any) {
    console.error('Failed to load chapters for subject:', err);
    chapterOptions.value = [];
    if (!isEditMode.value) {
      form.value.chapters = [];
    }
  } finally {
    isLoadingChapters.value = false;
  }
};

// Helper methods for chip functionality
const getChapterDisplayName = (chapterValue: string) => {
  // First check if it's an existing chapter from edit mode
  if (taskChapterMap.value.has(chapterValue)) {
    return taskChapterMap.value.get(chapterValue)!;
  }

  // Otherwise look it up in chapterOptions (for new chapters)
  const chapter = chapterOptions.value.find((ch) => ch.value === chapterValue);
  return chapter ? chapter.label : chapterValue;
};

const removeChapter = (chapterValue: string) => {
  if (isChapterAttempted(chapterValue)) {
    error.value = 'Cannot remove chapters that have been attempted';
    setTimeout(() => {
      error.value = null;
    }, 3000);
    return;
  }
  form.value.chapters = form.value.chapters.filter((ch) => ch !== chapterValue);
};

const selectAllChapters = () => {
  form.value.chapters = chapterOptions.value.map((chapter) => chapter.value);
};

const clearAllChapters = () => {
  // In edit mode, only clear non-attempted chapters
  if (isEditMode.value) {
    form.value.chapters = form.value.chapters.filter((id) => isChapterAttempted(id));
  } else {
    form.value.chapters = [];
  }
};

const { createTask: createTaskAPI } = useTask();

// Navigate to credits tab
const goToCredits = () => {
  router.push({ query: { tab: 'credits' } });
};

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;
    error.value = null;

    // Validate required fields
    if (!form.value.name || form.value.name.trim() === '') {
      error.value = 'Please enter a task name';
      return;
    }

    if (!form.value.subject || !form.value.lessonGenerationType) {
      error.value = 'Please select both subject and generation type';
      return;
    }

    if (!form.value.chapters?.length) {
      error.value = 'Please select at least one chapter';
      return;
    }

    // Validate quiz fields
    if (form.value.requiredScore === null || form.value.requiredScore === undefined || form.value.requiredScore < 0 || form.value.requiredScore > 100) {
      error.value = 'Required score must be between 0 and 100';
      return;
    }

    if (!form.value.questionsPerQuiz || form.value.questionsPerQuiz < 1 || form.value.questionsPerQuiz > 50) {
      error.value = 'Number of questions must be between 1 and 50';
      return;
    }

    if (form.value.creditsPerChapter == null || form.value.creditsPerChapter < 0) {
      error.value = 'Credits per chapter must be 0 or greater';
      return;
    }

    // Validate credit allocation
    if (!creditValidation.value.valid && totalCreditsNeeded.value > 0) {
      error.value = creditValidation.value.message;
      return;
    }

    if (isEditMode.value) {
      // Update existing task
      await $fetch(`/api/tasks/user-tasks/${props.task!.id}`, {
        method: 'PATCH',
        body: {
          name: form.value.name,
          creditPerChapter: form.value.creditsPerChapter,
          requiredScore: form.value.requiredScore,
          questionsPerQuiz: form.value.questionsPerQuiz,
          status: form.value.status,
          chapters: form.value.chapters
        }
      });
    } else {
      // Create new task
      const response = await createTaskAPI(form.value as unknown as CreateTaskReq);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create task');
      }
    }

    // Reset form
    form.value = getInitialForm();
    emit('task-saved');
  } catch (err: any) {
    error.value = err.message || `Failed to ${isEditMode.value ? 'update' : 'create'} task. Please try again.`;
  } finally {
    isSubmitting.value = false;
  }
};

// Initialize when modal opens
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    // Reset form based on mode
    form.value = getInitialForm();
    error.value = null;

    // Set default name for create mode
    if (!isEditMode.value) {
      form.value.name = defaultTaskName.value || 'New Task';
    }

    // Capture initial state for change detection (edit mode only)
    if (isEditMode.value) {
      initialFormData.value = JSON.parse(JSON.stringify(form.value));
    } else {
      initialFormData.value = null;
    }

    // Build chapter ID to name mapping for edit mode
    if (isEditMode.value && props.task) {
      taskChapterMap.value = new Map(
        props.task.chapters.map((c) => [c.id, c.displayName])
      );
    } else {
      taskChapterMap.value = new Map();
    }

    // Load data
    loadChildren();
    refreshCredits();

    // If edit mode, load subjects and chapters for the existing task
    if (isEditMode.value && props.task) {
      loadSubjectsForChild(props.task.assigneeUserInfoId);
      loadChaptersForSubject(props.task.subjectName);
    }
  }
});

// Watch for child selection to load subjects (create mode only)
watch(() => form.value.assigneeUserInfoId, (newChildId) => {
  if (!isEditMode.value && newChildId) {
    loadSubjectsForChild(newChildId);
  }
});

// Watch for subject selection to load chapters (create mode only)
watch(() => form.value.subject, (newSubject) => {
  if (!isEditMode.value && newSubject) {
    loadChaptersForSubject(newSubject);
  }
});
</script>
