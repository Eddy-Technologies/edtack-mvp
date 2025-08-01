<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ action === 'approve' ? 'Approve Task' : 'Reject Task' }}
          </h2>
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
          
          <!-- Child Info -->
          <div class="flex items-center space-x-2 text-sm text-gray-600 mb-3">
            <UIcon name="i-lucide-user" size="16" />
            <span>{{ task.child?.userDisplayFullName || 'Unknown Child' }}</span>
          </div>

          <!-- Credit Reward -->
          <div class="flex items-center space-x-1 text-green-600 font-medium mb-3">
            <UIcon name="i-lucide-coins" size="16" />
            <span>{{ formatCredits(task.credit) }} reward</span>
          </div>

          <!-- Completion Notes -->
          <div v-if="task.completion_notes" class="bg-blue-50 p-3 rounded-lg">
            <p class="text-sm text-blue-800">
              <strong>Child's Notes:</strong> {{ task.completion_notes }}
            </p>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="reviewTask" class="space-y-4">
          <!-- Approval/Rejection Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ action === 'approve' ? 'Approval Notes' : 'Rejection Reason' }}
            </label>
            <textarea
              v-model="reviewNotes"
              rows="4"
              :placeholder="action === 'approve' ? 'Great job! You completed the task well...' : 'Please redo this task because...'"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <p class="text-sm text-gray-500 mt-1">
              {{ action === 'approve' ? 'Encourage your child (optional)' : 'Explain what needs to be improved' }}
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
              :variant="action === 'approve' ? 'success' : 'danger'"
              :text="action === 'approve' ? 'Approve Task' : 'Reject Task'"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            />
          </div>
        </form>

        <!-- Info Note -->
        <div class="mt-4 p-3 rounded-lg" :class="action === 'approve' ? 'bg-green-50' : 'bg-red-50'">
          <p class="text-sm" :class="action === 'approve' ? 'text-green-800' : 'text-red-800'">
            <UIcon name="i-lucide-info" size="16" class="inline mr-1" />
            {{ action === 'approve' 
              ? 'Credits will be automatically awarded to your child.' 
              : 'The child will need to redo the task to earn credits.' 
            }}
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
  action: 'approve' | 'reject';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'task-reviewed'): void;
}>();

// Form state
const reviewNotes = ref('');
const isSubmitting = ref(false);
const error = ref<string | null>(null);

const reviewTask = async () => {
  try {
    isSubmitting.value = true;
    error.value = null;

    const response = await $fetch('/api/tasks/approve', {
      method: 'POST',
      body: {
        task_id: props.task.id,
        approved: props.action === 'approve',
        approval_notes: reviewNotes.value || null
      }
    });

    if (response.success) {
      // Reset form
      reviewNotes.value = '';
      emit('task-reviewed');
    } else {
      throw new Error(response.message || 'Failed to review task');
    }
  } catch (err: any) {
    console.error('Failed to review task:', err);
    error.value = err.data?.message || 'Failed to review task. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

const formatCredits = (cents: number) => {
  return `${(cents / 100).toFixed(0)} credits`;
};

// Reset form when modal closes or action changes
watch([() => props.isOpen, () => props.action], () => {
  if (!props.isOpen) {
    reviewNotes.value = '';
    error.value = null;
  }
});
</script>