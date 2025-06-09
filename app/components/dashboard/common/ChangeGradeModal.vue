<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" @click="closeModal">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-bold text-gray-900">Change Grade Level</h2>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors"
          @click="closeModal"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <form @submit.prevent="updateGrade">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Current Grade</label>
            <input
              :value="currentGrade"
              type="text"
              disabled
              class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            >
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">New Grade Level</label>
            <select
              v-model="selectedGrade"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-300': errorMessage }"
            >
              <option value="">Select grade level</option>
              <option v-for="grade in availableGrades" :key="grade" :value="grade">
                {{ grade }}
              </option>
            </select>
            <p v-if="errorMessage" class="mt-1 text-sm text-red-600">{{ errorMessage }}</p>
          </div>

          <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-sm text-blue-800">
              Changing your grade level will update your curriculum and available content to match your new grade.
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-4">
            <button
              type="button"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              @click="closeModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isProcessing || !selectedGrade"
              :class="[
                'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
                isProcessing || !selectedGrade
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              ]"
            >
              <span v-if="isProcessing">Updating...</span>
              <span v-else>Update Grade</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  isOpen: boolean;
  currentGrade: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'grade-updated', grade: string): void;
}>();

const selectedGrade = ref('');
const isProcessing = ref(false);
const errorMessage = ref('');

const availableGrades = ref([
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12'
]);

const closeModal = () => {
  emit('close');
  resetForm();
};

const resetForm = () => {
  selectedGrade.value = '';
  errorMessage.value = '';
  isProcessing.value = false;
};

const updateGrade = async () => {
  if (!selectedGrade.value) return;

  isProcessing.value = true;
  errorMessage.value = '';

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    emit('grade-updated', selectedGrade.value);
    closeModal();
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to update grade level. Please try again.';
  } finally {
    isProcessing.value = false;
  }
};
</script>
