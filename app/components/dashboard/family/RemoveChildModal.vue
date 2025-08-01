<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Remove Family Member</h2>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <UIcon name="i-lucide-x" size="24" />
          </button>
        </div>

        <!-- Child Info -->
        <div v-if="child" class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex items-center space-x-3">
            <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <span class="text-blue-700 font-medium">
                {{ getInitials(child.userDisplayFullName) }}
              </span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ child.userDisplayFullName }}</h3>
              <p class="text-sm text-gray-600">{{ child.email }}</p>
            </div>
          </div>
        </div>

        <!-- Warning -->
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex items-start space-x-3">
            <UIcon name="i-lucide-alert-triangle" class="text-red-600 flex-shrink-0 mt-0.5" size="20" />
            <div>
              <h4 class="text-red-800 font-medium mb-2">This action cannot be undone</h4>
              <p class="text-red-700 text-sm">
                Removing this family member will:
              </p>
              <ul class="text-red-700 text-sm mt-2 space-y-1">
                <li>• Remove their access to family tasks and credits</li>
                <li>• Cancel all pending tasks assigned to them</li>
                <li>• Keep their account but disconnect from your family</li>
                <li v-if="child?.credits > 0">• Preserve their current {{ formatCredits(child.credits) }} credits</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Confirmation Input -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Type "REMOVE" to confirm:
          </label>
          <input
            v-model="confirmationText"
            type="text"
            placeholder="REMOVE"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p class="text-red-600 text-sm">{{ error }}</p>
        </div>

        <!-- Actions -->
        <div class="flex space-x-3">
          <Button
            variant="secondary-gray"
            text="Cancel"
            @clicked="$emit('close')"
            :disabled="isSubmitting"
          />
          <Button
            variant="danger"
            text="Remove Family Member"
            :loading="isSubmitting"
            :disabled="isSubmitting || confirmationText !== 'REMOVE'"
            @clicked="removeChild"
          />
        </div>

        <!-- Info Note -->
        <div class="mt-4 p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            <UIcon name="i-lucide-info" size="16" class="inline mr-1" />
            The child can be re-added to your family later if needed.
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
  child: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'child-removed'): void;
}>();

// Form state
const confirmationText = ref('');
const isSubmitting = ref(false);
const error = ref<string | null>(null);

const removeChild = async () => {
  try {
    isSubmitting.value = true;
    error.value = null;

    const response = await $fetch('/api/family/remove-child', {
      method: 'POST',
      body: {
        childId: props.child.id
      }
    });

    if (response.success) {
      emit('child-removed');
    } else {
      throw new Error(response.message || 'Failed to remove family member');
    }
  } catch (err: any) {
    console.error('Failed to remove child:', err);
    error.value = err.data?.message || 'Failed to remove family member. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

// Utility functions
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const formatCredits = (cents: number) => {
  return `${(cents / 100).toFixed(0)} credits`;
};

// Reset form when modal closes
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    confirmationText.value = '';
    error.value = null;
  }
});
</script>