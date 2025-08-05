<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
              v-model="form.assignee_user_info_id"
              :options="childrenOptions"
              placeholder="Select a child"
              :disabled="isSubmitting"
              required
            />
          </div>

          <!-- Task Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Task Name *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g., Clean your room"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>

          <!-- Subtitle -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <input
              v-model="form.subtitle"
              type="text"
              placeholder="Brief description"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Detailed instructions..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Credits -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Credit Reward *
            </label>
            <input
              v-model.number="form.creditAmount"
              type="number"
              min="1"
              max="1000"
              required
              placeholder="50"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p class="text-sm text-gray-500 mt-1">Credits to award when task is completed</p>
          </div>

          <!-- Priority -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              v-model="form.priority"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select priority</option>
              <option v-for="priority in taskPriorities" :key="priority.value" :value="priority.value">
                {{ priority.label }}
              </option>
            </select>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              v-model="form.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No Category</option>
              <option v-for="category in taskCategories" :key="category.value" :value="category.value">
                {{ category.label }}
              </option>
            </select>
          </div>

          <!-- Due Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              v-model="form.due_date"
              type="date"
              :min="today"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>

          <!-- Auto-Approve Option -->
          <div class="flex items-center space-x-2">
            <input
              id="auto_approve"
              v-model="form.auto_approve"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <label for="auto_approve" class="text-sm font-medium text-gray-700">
              Auto-approve when completed
            </label>
          </div>
          <p class="text-sm text-gray-500 -mt-2">
            Child will receive credits immediately without requiring your approval
          </p>

          <!-- Recurring Task Options -->
          <div class="border-t pt-4">
            <div class="flex items-center space-x-2 mb-3">
              <input
                id="is_recurring"
                v-model="form.is_recurring"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label for="is_recurring" class="text-sm font-medium text-gray-700">
                Make this a recurring task
              </label>
            </div>

            <div v-if="form.is_recurring" class="space-y-4 pl-6 border-l-2 border-blue-100">
              <!-- Frequency -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Repeat Frequency *
                </label>
                <select
                  v-model="form.recurrence_frequency"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select frequency</option>
                  <option v-for="frequency in recurrenceOptions" :key="frequency.value" :value="frequency.value">
                    {{ frequency.label }}
                  </option>
                </select>
              </div>

              <!-- Interval -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Repeat Every
                </label>
                <div class="flex items-center space-x-2">
                  <input
                    v-model.number="form.recurrence_interval"
                    type="number"
                    min="1"
                    max="365"
                    class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                  <span class="text-sm text-gray-600">
                    {{ getIntervalLabel(form.recurrence_frequency) }}
                  </span>
                </div>
              </div>

              <!-- End Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  v-model="form.recurrence_end_date"
                  type="date"
                  :min="today"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <p class="text-sm text-gray-500 mt-1">
                  Leave empty to repeat indefinitely
                </p>
              </div>
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
import { RECURRENCE_FREQUENCY, TASK_PRIORITY } from '~~/shared/constants';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close' | 'task-created'): void;
}>();

// Form state
const form = ref({
  assignee_user_info_id: '',
  name: '',
  subtitle: '',
  description: '',
  creditAmount: 50,
  priority: TASK_PRIORITY.MEDIUM,
  category: '',
  due_date: '',
  auto_approve: false,
  is_recurring: false,
  recurrence_frequency: '',
  recurrence_interval: 1,
  recurrence_end_date: ''
});

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
const taskPriorities = computed(() => codesStore.taskPriorities);
const taskCategories = computed(() => codesStore.taskCategories);
const recurrenceOptions = computed(() => codesStore.recurrenceFrequencies);

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

    // Validate recurring task fields
    if (form.value.is_recurring && !form.value.recurrence_frequency) {
      error.value = 'Please select a frequency for recurring tasks';
      return;
    }

    const response = await $fetch('/api/tasks/create', {
      method: 'POST',
      body: {
        assignee_user_info_id: form.value.assignee_user_info_id,
        name: form.value.name,
        subtitle: form.value.subtitle || null,
        description: form.value.description || null,
        credit: form.value.creditAmount * 100, // Convert to cents
        priority: form.value.priority,
        category: form.value.category || null,
        due_date: form.value.due_date || null,
        auto_approve: form.value.auto_approve,
        is_recurring: form.value.is_recurring,
        recurrence_frequency: form.value.is_recurring ? form.value.recurrence_frequency : null,
        recurrence_interval: form.value.is_recurring ? form.value.recurrence_interval : null,
        recurrence_end_date: form.value.is_recurring && form.value.recurrence_end_date ? form.value.recurrence_end_date : null
      }
    });

    if (response.success) {
      // Reset form
      form.value = {
        assignee_user_info_id: '',
        name: '',
        subtitle: '',
        description: '',
        creditAmount: 50,
        priority: TASK_PRIORITY.MEDIUM,
        category: '',
        due_date: '',
        auto_approve: false,
        is_recurring: false,
        recurrence_frequency: '',
        recurrence_interval: 1,
        recurrence_end_date: ''
      };

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

const getIntervalLabel = (frequency: string) => {
  switch (frequency) {
    case RECURRENCE_FREQUENCY.DAILY: return 'day(s)';
    case RECURRENCE_FREQUENCY.WEEKLY: return 'week(s)';
    case RECURRENCE_FREQUENCY.MONTHLY: return 'month(s)';
    default: return '';
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
