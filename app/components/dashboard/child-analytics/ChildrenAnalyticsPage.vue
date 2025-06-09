<template>
  <div class="space-y-6">
    <!-- Child Selector -->
    <ChildSelector
      :children="children"
      :selected-child-index="selectedChildIndex"
      @child-selected="selectChild"
    />

    <!-- Analytics for Selected Child -->
    <ChildAnalytics
      v-if="selectedChild"
      :child-id="selectedChild.id"
      :analytics="selectedChild.analytics"
    />

    <!-- Empty State -->
    <div v-else class="bg-white rounded-xl shadow-sm border p-12 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          class="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No Children Found</h3>
      <p class="text-gray-600 mb-6">Add children to your account to view their analytics and progress.</p>
      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Add Child
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ChildSelector from './ChildSelector.vue';
import ChildAnalytics from './ChildAnalytics.vue';

// Sample data - in real app this would come from API/store
const children = ref([
  {
    id: '1',
    name: 'Emma Johnson',
    avatar: '/boy.png',
    grade: 'Grade 8',
    school: 'Lincoln Middle School',
    isOnline: true,
    lastActive: '2 minutes ago',
    stats: {
      grade: 87,
      hours: 24,
      notes: 15
    },
    analytics: {
      totalStudyHours: 24.5,
      studyHoursIncrease: 12,
      averageGrade: 87,
      gradeImprovement: 5,
      questionsAnswered: 142,
      accuracyRate: 84,
      streak: 7,
      streakType: 'Study streak'
    }
  },
  {
    id: '2',
    name: 'Alex Smith',
    avatar: '/girl.png',
    grade: 'Grade 6',
    school: 'Riverside Elementary',
    isOnline: false,
    lastActive: '1 hour ago',
    stats: {
      grade: 92,
      hours: 18,
      notes: 22
    },
    analytics: {
      totalStudyHours: 18.2,
      studyHoursIncrease: 8,
      averageGrade: 92,
      gradeImprovement: 3,
      questionsAnswered: 98,
      accuracyRate: 91,
      streak: 5,
      streakType: 'Perfect score streak'
    }
  },
  {
    id: '3',
    name: 'Sofia Garcia',
    avatar: '/child.png',
    grade: 'Grade 10',
    school: 'Washington High School',
    isOnline: true,
    lastActive: 'Active now',
    stats: {
      grade: 78,
      hours: 31,
      notes: 28
    },
    analytics: {
      totalStudyHours: 31.8,
      studyHoursIncrease: 15,
      averageGrade: 78,
      gradeImprovement: 8,
      questionsAnswered: 205,
      accuracyRate: 76,
      streak: 12,
      streakType: 'Daily login streak'
    }
  }
]);

const selectedChildIndex = ref(0);

const selectedChild = computed(() => {
  return children.value[selectedChildIndex.value] || null;
});

const selectChild = (index: number) => {
  selectedChildIndex.value = index;
};
</script>
