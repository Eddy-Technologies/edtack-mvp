<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">Children Management</h2>
      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <svg
          class="w-4 h-4 inline mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Child
      </button>
    </div>

    <!-- Children Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="child in children" :key="child.id" class="bg-white rounded-xl shadow-sm border">
        <!-- Child Header -->
        <div class="p-6 border-b">
          <div class="flex items-center space-x-4">
            <img :src="child.avatar" :alt="child.name" class="w-16 h-16 rounded-full">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900">{{ child.name }}</h3>
              <p class="text-gray-600">{{ child.grade }} • Age {{ child.age }}</p>
              <div class="flex items-center mt-1">
                <div
                  :class="[
                    'w-2 h-2 rounded-full mr-2',
                    child.isOnline ? 'bg-green-400' : 'bg-gray-300'
                  ]"
                />
                <span class="text-sm text-gray-500">{{ child.isOnline ? 'Online' : 'Offline' }}</span>
              </div>
            </div>
            <div class="flex space-x-2">
              <button class="p-2 text-gray-400 hover:text-gray-600">
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button class="p-2 text-gray-400 hover:text-gray-600">
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="p-6 border-b">
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ child.stats.notes }}</div>
              <div class="text-xs text-gray-600">Notes</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ child.stats.hours }}h</div>
              <div class="text-xs text-gray-600">Study Time</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ child.stats.grade }}%</div>
              <div class="text-xs text-gray-600">Avg Grade</div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="p-6 border-b">
          <h4 class="font-medium text-gray-900 mb-3">Recent Activity</h4>
          <div class="space-y-2">
            <div v-for="activity in child.recentActivity" :key="activity.id" class="flex items-center text-sm">
              <div class="w-2 h-2 bg-blue-400 rounded-full mr-3" />
              <span class="text-gray-900">{{ activity.action }}</span>
              <span class="text-gray-500 ml-auto">{{ activity.time }}</span>
            </div>
          </div>
        </div>

        <!-- Current Subjects -->
        <div class="p-6 border-b">
          <h4 class="font-medium text-gray-900 mb-3">Current Subjects</h4>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="subject in child.subjects" :key="subject.name" class="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span class="text-sm font-medium">{{ subject.name }}</span>
              <span
                :class="[
                  'text-xs px-2 py-1 rounded-full',
                  subject.performance === 'excellent' ? 'bg-green-100 text-green-800' :
                  subject.performance === 'good' ? 'bg-blue-100 text-blue-800' :
                  subject.performance === 'average' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                ]"
              >
                {{ subject.performance }}
              </span>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="p-6">
          <div class="grid grid-cols-2 gap-3">
            <button class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
              View Full Report
            </button>
            <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              Manage Settings
            </button>
          </div>

          <!-- Screen Time Controls -->
          <div class="mt-4 pt-4 border-t">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-900">Daily Screen Time</span>
              <span class="text-sm text-gray-600">{{ child.screenTime.used }}h / {{ child.screenTime.limit }}h</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" :style="{ width: (child.screenTime.used / child.screenTime.limit) * 100 + '%' }" />
            </div>
            <div class="flex justify-between mt-2">
              <button class="text-xs text-blue-600 hover:text-blue-700">Adjust Limit</button>
              <button class="text-xs text-blue-600 hover:text-blue-700">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Family Calendar -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Family Calendar</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="event in familyEvents" :key="event.id" class="border rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <div
                  :class="[
                    'w-3 h-3 rounded-full mt-1',
                    event.type === 'assignment' ? 'bg-red-400' :
                    event.type === 'test' ? 'bg-yellow-400' :
                    event.type === 'activity' ? 'bg-blue-400' :
                    'bg-green-400'
                  ]"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900">{{ event.title }}</h4>
                <p class="text-sm text-gray-600">{{ event.description }}</p>
                <div class="flex items-center mt-1 text-xs text-gray-500">
                  <span>{{ event.date }}</span>
                  <span class="mx-1">•</span>
                  <span>{{ event.child }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const children = ref([
  {
    id: 1,
    name: 'Emma Johnson',
    grade: 'Grade 5',
    age: 10,
    avatar: '/child1-avatar.png',
    isOnline: true,
    stats: {
      notes: 23,
      hours: 45,
      grade: 87
    },
    recentActivity: [
      { id: 1, action: 'Completed Math homework', time: '2h ago' },
      { id: 2, action: 'Created Science notes', time: '4h ago' },
      { id: 3, action: 'Took English quiz', time: '1d ago' }
    ],
    subjects: [
      { name: 'Math', performance: 'excellent' },
      { name: 'Science', performance: 'good' },
      { name: 'English', performance: 'good' },
      { name: 'History', performance: 'average' }
    ],
    screenTime: {
      used: 3.2,
      limit: 4
    }
  },
  {
    id: 2,
    name: 'Liam Johnson',
    grade: 'Grade 3',
    age: 8,
    avatar: '/child2-avatar.png',
    isOnline: false,
    stats: {
      notes: 15,
      hours: 28,
      grade: 82
    },
    recentActivity: [
      { id: 1, action: 'Finished reading assignment', time: '1d ago' },
      { id: 2, action: 'Practiced multiplication', time: '1d ago' },
      { id: 3, action: 'Drew science diagram', time: '2d ago' }
    ],
    subjects: [
      { name: 'Math', performance: 'good' },
      { name: 'Reading', performance: 'excellent' },
      { name: 'Science', performance: 'good' },
      { name: 'Art', performance: 'excellent' }
    ],
    screenTime: {
      used: 1.5,
      limit: 2.5
    }
  },
  {
    id: 3,
    name: 'Sophia Johnson',
    grade: 'Grade 7',
    age: 12,
    avatar: '/child3-avatar.png',
    isOnline: true,
    stats: {
      notes: 31,
      hours: 67,
      grade: 91
    },
    recentActivity: [
      { id: 1, action: 'Submitted History essay', time: '30m ago' },
      { id: 2, action: 'Studied for Biology test', time: '2h ago' },
      { id: 3, action: 'Completed algebra homework', time: '5h ago' }
    ],
    subjects: [
      { name: 'Algebra', performance: 'excellent' },
      { name: 'Biology', performance: 'excellent' },
      { name: 'History', performance: 'good' },
      { name: 'English', performance: 'excellent' }
    ],
    screenTime: {
      used: 4.1,
      limit: 5
    }
  }
]);

const familyEvents = ref([
  {
    id: 1,
    title: 'Math Test',
    description: 'Chapter 5 - Fractions and Decimals',
    date: 'Tomorrow',
    child: 'Emma',
    type: 'test'
  },
  {
    id: 2,
    title: 'Science Project Due',
    description: 'Solar System Model',
    date: 'Friday',
    child: 'Sophia',
    type: 'assignment'
  },
  {
    id: 3,
    title: 'Reading Club',
    description: 'Weekly reading session',
    date: 'Saturday',
    child: 'Liam',
    type: 'activity'
  },
  {
    id: 4,
    title: 'Parent-Teacher Conference',
    description: 'Quarterly progress review',
    date: 'Next Monday',
    child: 'All',
    type: 'meeting'
  },
  {
    id: 5,
    title: 'Art Exhibition',
    description: 'School art show',
    date: 'Next Wednesday',
    child: 'Liam',
    type: 'activity'
  },
  {
    id: 6,
    title: 'History Report',
    description: 'World War II research paper',
    date: 'Next Friday',
    child: 'Sophia',
    type: 'assignment'
  }
]);
</script>
