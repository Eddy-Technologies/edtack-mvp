<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" @click="closeModal">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full" @click.stop>
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-bold text-gray-900">Parental Controls</h2>
        <button class="text-gray-400 hover:text-gray-600" @click="closeModal">
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
      <div class="p-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700">Content Filtering</span>
            <input type="checkbox" class="rounded">
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700">Screen Time Limits</span>
            <input type="checkbox" class="rounded">
          </div>
        </div>
        <div class="flex space-x-4 mt-6">
          <button type="button" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" @click="closeModal">Cancel</button>
          <button type="button" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" @click="closeModal">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{ (e: 'close'): void }>();

const closeModal = () => emit('close');
</script>
