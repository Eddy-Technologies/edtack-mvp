<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
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
            <USelect
              v-model="form.subject"
              :options="subjects"
              placeholder="Select a subject"
              :disabled="isSubmitting"
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
              max="1000"
              required
              placeholder="50"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p class="text-sm text-gray-500 mt-1">Amount of credits student will receive for completing each quiz</p>
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
    lessonGenerationType: LESSON_GENERATION_TYPE.QUIZ, // Default to QUIZ
    creditsPerQuiz: 50,
    requiredScore: 80,
  };
};

const form = ref<CreateTaskReq>(getInitialForm());
const codesStore = useCodesStore();
const children = ref<any[]>([]);
const subjects = ref<any[]>([]);
const isSubmitting = ref(false);
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
    const response = await $fetch(`/api/curriculum/subjects/${childId}`);
    if (response.success) {
      subjects.value = response.subjects || [];
      // Reset subject selection when child changes
      form.value.subject = '';
    }
  } catch (err: any) {
    console.error('Failed to load subjects for child:', err);
    subjects.value = [];
    form.value.subject = '';
  }
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

    // Validate quiz fields
    if (form.value.requiredScore < 0 || form.value.requiredScore > 100) {
      error.value = 'Required score must be between 0 and 100';
      return;
    }

    if (!form.value.creditsPerQuiz || form.value.creditsPerQuiz < 1) {
      error.value = 'Credits per quiz must be at least 1';
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
  }
});

// Watch for modal open to load children
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    loadChildren();
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
  }
});
</script>
