<template>
  <div class="bg-white rounded-xl shadow-sm border p-6 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-900">Children Analytics</h2>
      <div class="text-sm text-gray-500">
        {{ children.length }} {{ children.length === 1 ? 'Child' : 'Children' }}
      </div>
    </div>

    <!-- Child Tabs -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="(child, index) in children"
          :key="child.id"
          :class="[
            selectedChildIndex === index
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors'
          ]"
          @click="selectChild(index)"
        >
          <div class="flex items-center space-x-2">
            <img
              :src="child.avatar"
              :alt="child.name"
              class="w-6 h-6 rounded-full"
            >
            <span>{{ child.name }}</span>
            <div
              v-if="child.isOnline"
              class="w-2 h-2 bg-green-400 rounded-full"
              title="Online"
            />
          </div>
        </button>
      </nav>
    </div>

    <!-- Selected Child Info -->
    <div v-if="selectedChild" class="mt-4 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <img
          :src="selectedChild.avatar"
          :alt="selectedChild.name"
          class="w-12 h-12 rounded-full"
        >
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedChild.name }}</h3>
          <div class="flex items-center space-x-4 text-sm text-gray-600">
            <span>{{ selectedChild.grade }}</span>
            <span>•</span>
            <span>{{ selectedChild.school }}</span>
            <span>•</span>
            <span :class="selectedChild.isOnline ? 'text-green-600' : 'text-gray-500'">
              {{ selectedChild.isOnline ? 'Online' : `Last seen ${selectedChild.lastActive}` }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="flex items-center space-x-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ selectedChild.stats.grade }}%</div>
          <div class="text-xs text-gray-500">Avg Grade</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ selectedChild.stats.hours }}h</div>
          <div class="text-xs text-gray-500">Study Time</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">{{ selectedChild.stats.notes }}</div>
          <div class="text-xs text-gray-500">Notes</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Child {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  school: string;
  isOnline: boolean;
  lastActive: string;
  stats: {
    grade: number;
    hours: number;
    notes: number;
  };
}

interface Props {
  children: Child[];
  selectedChildIndex: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'child-selected', index: number): void;
}>();

const selectedChild = computed(() => {
  return props.children[props.selectedChildIndex] || null;
});

const selectChild = (index: number) => {
  emit('child-selected', index);
};
</script>
