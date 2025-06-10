<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" @click="closeModal">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full" @click.stop>
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-xl font-bold text-gray-900">Edit Child</h2>
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
        <div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input v-model="childData.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Grade</label>
              <select v-model="childData.grade" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option v-for="grade in grades" :key="grade" :value="grade">{{ grade }}</option>
              </select>
            </div>
          </div>
          <div class="flex space-x-4 mt-6">
            <Button variant="secondary-gray" text="Cancel" extra-classes="flex-1" @clicked="closeModal" />
            <Button variant="primary" text="Update" extra-classes="flex-1" @clicked="updateChild" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from '../../common/Button.vue';

interface Props {
  isOpen: boolean;
  child: any;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'child-updated', child: any): void;
}>();

const childData = ref({ name: '', grade: '' });
const grades = ref(['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']);

const closeModal = () => emit('close');
const updateChild = () => {
  emit('child-updated', childData.value);
  closeModal();
};
</script>
