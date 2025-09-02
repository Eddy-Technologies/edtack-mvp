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
              :options="subjectOptions"
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

          <!-- Credits -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Credit Reward *
            </label>
            <input
              v-model.number="form.credit"
              type="number"
              min="1"
              max="1000"
              required
              placeholder="50"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p class="text-sm text-gray-500 mt-1">Amount of credits student will receive when task is completed</p>
          </div>

          <!-- Number of Questions per Quiz -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions per Quiz *
            </label>
            <input
              v-model.number="form.questionsPerQuiz"
              type="number"
              min="1"
              max="50"
              required
              placeholder="10"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p class="text-sm text-gray-500 mt-1">Number of questions to include in each quiz</p>
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

          <!-- Recurring Task Options -->
          <div class="border-t pt-4">
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Schedule
              </label>
              <div class="text-xs text-gray-500 mb-3 space-y-1">
                <p><strong>One-off:</strong> Task is assigned only once</p>
                <p><strong>Daily:</strong> A new task will be assigned every day</p>
                <p><strong>Weekly:</strong> A new task will be assigned every Sunday</p>
                <p><strong>Monthly:</strong> A new task will be assigned on the 1st day of each month</p>
              </div>
              <select
                v-model="form.recurrenceFrequency"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select schedule</option>
                <option v-for="frequency in recurrenceOptions" :key="frequency.value" :value="frequency.value">
                  {{ frequency.label }}
                </option>
              </select>
            </div>
            <!-- Due Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Due Date
                <p class="text-xs text-gray-500 mb-3">Set a date of which this task will stop repeating. Leave blank if you want it to run forever.</p>

              </label>
              <input
                v-model="form.dueDate"
                type="date"
                :min="today"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
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
import { LESSON_GENERATION_TYPE, RECURRENCE_FREQUENCY } from '~~/shared/constants';
import type { CreateTaskReq } from '~~/server/api/tasks/create.post';

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
    credit: 50,
    questionsPerQuiz: 10,
    requiredScore: 80,
    dueDate: '',
    recurrenceFrequency: RECURRENCE_FREQUENCY.ONE_OFF,
  };
};

const form = ref<CreateTaskReq>(getInitialForm());
const codesStore = useCodesStore();
const children = ref<any[]>([]);
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

// Get options from codes store
const recurrenceOptions = computed(() => codesStore.recurrenceFrequencies);
const subjectOptions = computed(() => codesStore.subjects);
const lessonGenerationTypeOptions = computed(() => codesStore.lessonGenerationTypes);

// Check if task is recurring (not one-off)
const isRecurringTask = computed(() => {
  return form.value.recurrenceFrequency && form.value.recurrenceFrequency !== 'ONE_OFF';
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
    if (!form.value.questionsPerQuiz || form.value.questionsPerQuiz < 1 || form.value.questionsPerQuiz > 50) {
      error.value = 'Number of questions must be between 1 and 50';
      return;
    }

    if (form.value.requiredScore < 0 || form.value.requiredScore > 100) {
      error.value = 'Required score must be between 0 and 100';
      return;
    }

    // Validate recurring task fields
    if (isRecurringTask.value && !form.value.recurrenceFrequency) {
      error.value = 'Please select a valid schedule';
      return;
    }

    const response = await $fetch('/api/tasks/create', {
      method: 'POST',
      body: form.value as CreateTaskReq
    });

    if (response.success) {
      // Reset form
      form.value = getInitialForm();

      emit('task-created');
    } else {
      throw new Error(response.message || 'Failed to create task');
    }
  } catch (err: any) {
    console.error('Failed to create task:', err);
    error.value = err.data?.message || 'Failed to create task. Please try again.';
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
</script>
