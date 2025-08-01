<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Complete Task</h2>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <UIcon name="i-lucide-x" size="24" />
          </button>
        </div>

        <!-- Task Info -->
        <div v-if="task" class="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 class="font-semibold text-gray-900 mb-2">{{ task.name }}</h3>
          <p v-if="task.subtitle" class="text-gray-600 mb-2">{{ task.subtitle }}</p>
          <p v-if="task.description" class="text-gray-700 mb-3">{{ task.description }}</p>
          <div class="flex items-center space-x-1 text-green-600 font-medium">
            <UIcon name="i-lucide-coins" size="16" />
            <span>{{ formatCredits(task.credit) }} reward</span>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="completeTask" class="space-y-4">
          <!-- Completion Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Completion Notes
            </label>
            <textarea
              v-model="completionNotes"
              rows="4"
              placeholder="Describe what you did to complete this task..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <p class="text-sm text-gray-500 mt-1">
              Tell your parent how you completed the task (optional)
            </p>
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
              @clicked="$emit('close')"
              :disabled="isSubmitting"
            />
            <Button
              type="submit"
              variant="success"
              text="Mark Complete"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            />
          </div>
        </form>

        <!-- Info Note -->
        <div class="mt-4 p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            <UIcon name="i-lucide-info" size="16" class="inline mr-1" />
            Your parent will review your completion before awarding credits.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from '../../common/Button.vue';

const props = defineProps<{
  isOpen: boolean;
  task: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'task-completed'): void;
}>();

// Form state
const completionNotes = ref('');
const isSubmitting = ref(false);
const error = ref<string | null>(null);

const completeTask = async () => {
  try {
    isSubmitting.value = true;
    error.value = null;

    const response = await $fetch('/api/tasks/complete', {
      method: 'POST',
      body: {
        task_id: props.task.id,
        completion_notes: completionNotes.value || null
      }
    });

    if (response.success) {
      // Reset form
      completionNotes.value = '';
      emit('task-completed');
    } else {
      throw new Error(response.message || 'Failed to complete task');
    }
  } catch (err: any) {
    console.error('Failed to complete task:', err);
    error.value = err.data?.message || 'Failed to complete task. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

const formatCredits = (cents: number) => {
  return `${(cents / 100).toFixed(0)} credits`;
};

// Reset form when modal closes
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    completionNotes.value = '';
    error.value = null;
  }
});
</script>