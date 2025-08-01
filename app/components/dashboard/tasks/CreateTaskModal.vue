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
            <select
              v-model="form.child_user_info_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a child</option>
              <option v-for="child in children" :key="child.id" :value="child.id">
                {{ child.userDisplayFullName }}
              </option>
            </select>
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
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
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
              <option value="chores">Chores</option>
              <option value="homework">Homework</option>
              <option value="behavior">Behavior</option>
              <option value="exercise">Exercise</option>
              <option value="reading">Reading</option>
              <option value="other">Other</option>
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

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>

          <!-- Actions -->
          <div class="flex space-x-3 pt-4">
            <Button
              variant="secondary-gray"
              text="Cancel"
              :disabled="isSubmitting"
              @clicked="$emit('close')"
            />
            <Button
              type="submit"
              variant="primary"
              text="Create Task"
              :loading="isSubmitting"
              :disabled="isSubmitting"
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

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close' | 'task-created'): void;
}>();

// Form state
const form = ref({
  child_user_info_id: '',
  name: '',
  subtitle: '',
  description: '',
  creditAmount: 50,
  priority: 'medium',
  category: '',
  due_date: ''
});

const children = ref<any[]>([]);
const isSubmitting = ref(false);
const error = ref<string | null>(null);

const today = computed(() => {
  return new Date().toISOString().split('T')[0];
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

    const response = await $fetch('/api/tasks/create', {
      method: 'POST',
      body: {
        child_user_info_id: form.value.child_user_info_id,
        name: form.value.name,
        subtitle: form.value.subtitle || null,
        description: form.value.description || null,
        credit: form.value.creditAmount * 100, // Convert to cents
        priority: form.value.priority,
        category: form.value.category || null,
        due_date: form.value.due_date || null
      }
    });

    if (response.success) {
      // Reset form
      form.value = {
        child_user_info_id: '',
        name: '',
        subtitle: '',
        description: '',
        creditAmount: 50,
        priority: 'medium',
        category: '',
        due_date: ''
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
