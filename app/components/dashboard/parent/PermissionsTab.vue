<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-xl shadow-sm border p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Permissions & Controls</h2>
      <p class="text-gray-600">Manage what your children can access and do on the platform</p>
    </div>

    <!-- Child Selector -->
    <div class="bg-white rounded-xl shadow-sm border p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Select Child</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          v-for="child in children"
          :key="child.id"
          :class="[
            'p-4 border rounded-lg transition-colors text-left',
            selectedChild === child.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          ]"
          @click="selectedChild = child.id"
        >
          <div class="flex items-center space-x-3">
            <img :src="child.avatar" :alt="child.name" class="w-10 h-10 rounded-full">
            <div>
              <h4 class="font-medium text-gray-900">{{ child.name }}</h4>
              <p class="text-sm text-gray-600">{{ child.grade }}</p>
            </div>
          </div>
        </button>
      </div>
    </div>

    <div v-if="selectedChild" class="space-y-6">
      <!-- App Usage Controls -->
      <div class="bg-white rounded-xl shadow-sm border">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">App Usage Controls</h3>
          <p class="text-gray-600">Control when and how {{ selectedChildData.name }} can use the app</p>
        </div>
        <div class="p-6 space-y-6">
          <!-- Screen Time Limits -->
          <div>
            <h4 class="font-medium text-gray-900 mb-4">Daily Screen Time Limit</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Weekdays</label>
                <div class="flex items-center space-x-3">
                  <input
                    v-model="selectedChildData.permissions.screenTime.weekdays"
                    type="range"
                    min="0"
                    max="8"
                    step="0.5"
                    class="flex-1"
                  >
                  <span class="text-sm text-gray-600 w-16">{{ selectedChildData.permissions.screenTime.weekdays }}h</span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Weekends</label>
                <div class="flex items-center space-x-3">
                  <input
                    v-model="selectedChildData.permissions.screenTime.weekends"
                    type="range"
                    min="0"
                    max="12"
                    step="0.5"
                    class="flex-1"
                  >
                  <span class="text-sm text-gray-600 w-16">{{ selectedChildData.permissions.screenTime.weekends }}h</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Time Restrictions -->
          <div class="border-t pt-6">
            <h4 class="font-medium text-gray-900 mb-4">Time Restrictions</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Allowed Start Time</label>
                <input
                  v-model="selectedChildData.permissions.timeRestrictions.startTime"
                  type="time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Allowed End Time</label>
                <input
                  v-model="selectedChildData.permissions.timeRestrictions.endTime"
                  type="time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
          </div>

          <!-- Bedtime Mode -->
          <div class="border-t pt-6">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium text-gray-900">Bedtime Mode</h4>
                <p class="text-sm text-gray-600">Automatically restrict access during bedtime hours</p>
              </div>
              <button
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  selectedChildData.permissions.bedtimeMode.enabled ? 'bg-blue-600' : 'bg-gray-200'
                ]"
                @click="selectedChildData.permissions.bedtimeMode.enabled = !selectedChildData.permissions.bedtimeMode.enabled"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    selectedChildData.permissions.bedtimeMode.enabled ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
            </div>
            <div v-if="selectedChildData.permissions.bedtimeMode.enabled" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Bedtime</label>
                <input
                  v-model="selectedChildData.permissions.bedtimeMode.startTime"
                  type="time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Wake Up Time</label>
                <input
                  v-model="selectedChildData.permissions.bedtimeMode.endTime"
                  type="time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Store Filter Permissions -->
      <div class="bg-white rounded-xl shadow-sm border">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Store Filter Permissions</h3>
          <p class="text-gray-600">Control what {{ selectedChildData.name }} can see and purchase in the store</p>
        </div>
        <div class="p-6 space-y-6">
          <!-- Store Categories -->
          <div>
            <h4 class="font-medium text-gray-900 mb-4">Store Categories</h4>
            <div class="space-y-3">
              <div v-for="category in storeCategories" :key="category.key" class="flex items-center justify-between py-3 border-b last:border-b-0">
                <div class="flex-1">
                  <h5 class="font-medium text-gray-900">{{ category.name }}</h5>
                  <p class="text-sm text-gray-600">{{ category.description }}</p>
                </div>
                <button
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4',
                    selectedChildData.permissions.storeFilter[category.key] ? 'bg-blue-600' : 'bg-gray-200'
                  ]"
                  @click="selectedChildData.permissions.storeFilter[category.key] = !selectedChildData.permissions.storeFilter[category.key]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      selectedChildData.permissions.storeFilter[category.key] ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Age Restrictions -->
          <div class="border-t pt-6">
            <h4 class="font-medium text-gray-900 mb-4">Age-Appropriate Content</h4>
            <div class="space-y-2">
              <label v-for="rating in ageRatings" :key="rating.value" class="flex items-center">
                <input
                  v-model="selectedChildData.permissions.storeFilter.ageRating"
                  type="radio"
                  :value="rating.value"
                  class="mr-3 text-blue-600"
                >
                <div>
                  <span class="font-medium text-gray-900">{{ rating.name }}</span>
                  <p class="text-sm text-gray-600">{{ rating.description }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Price Filters -->
          <div class="border-t pt-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h4 class="font-medium text-gray-900">Price Range Filter</h4>
                <p class="text-sm text-gray-600">Hide items above price limit</p>
              </div>
              <button
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  selectedChildData.permissions.storeFilter.priceFilterEnabled ? 'bg-blue-600' : 'bg-gray-200'
                ]"
                @click="selectedChildData.permissions.storeFilter.priceFilterEnabled = !selectedChildData.permissions.storeFilter.priceFilterEnabled"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    selectedChildData.permissions.storeFilter.priceFilterEnabled ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
            </div>
            <div v-if="selectedChildData.permissions.storeFilter.priceFilterEnabled" class="flex items-center space-x-3">
              <span class="text-gray-700">Max $</span>
              <input
                v-model="selectedChildData.permissions.storeFilter.maxPrice"
                type="number"
                min="0"
                max="100"
                class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <span class="text-gray-600">per item</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Changes -->
      <div class="flex justify-end space-x-3">
        <button class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Reset to Default
        </button>
        <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const selectedChild = ref(1);
const children = ref([
  {
    id: 1,
    name: 'Emma Johnson',
    grade: 'Grade 5',
    avatar: '/child1-avatar.png',
    permissions: {
      screenTime: {
        weekdays: 3,
        weekends: 5
      },
      timeRestrictions: {
        startTime: '08:00',
        endTime: '19:00'
      },
      bedtimeMode: {
        enabled: true,
        startTime: '20:00',
        endTime: '07:00'
      },
      storeFilter: {
        books: true,
        games: true,
        videos: true,
        accessories: false,
        toys: true,
        clothing: false,
        ageRating: 'age10',
        priceFilterEnabled: true,
        maxPrice: 20
      }
    }
  },
  {
    id: 2,
    name: 'Liam Johnson',
    grade: 'Grade 3',
    avatar: '/child2-avatar.png',
    permissions: {
      screenTime: {
        weekdays: 2,
        weekends: 3.5
      },
      timeRestrictions: {
        startTime: '09:00',
        endTime: '18:00'
      },
      bedtimeMode: {
        enabled: true,
        startTime: '19:30',
        endTime: '07:30'
      },
      storeFilter: {
        books: true,
        games: true,
        videos: false,
        accessories: false,
        toys: true,
        clothing: false,
        ageRating: 'age8',
        priceFilterEnabled: true,
        maxPrice: 15
      }
    }
  },
  {
    id: 3,
    name: 'Sophia Johnson',
    grade: 'Grade 7',
    avatar: '/child3-avatar.png',
    permissions: {
      screenTime: {
        weekdays: 4,
        weekends: 6
      },
      timeRestrictions: {
        startTime: '07:00',
        endTime: '21:00'
      },
      bedtimeMode: {
        enabled: true,
        startTime: '21:30',
        endTime: '06:30'
      },
      storeFilter: {
        books: true,
        games: true,
        videos: true,
        accessories: true,
        toys: false,
        clothing: true,
        ageRating: 'age12',
        priceFilterEnabled: false,
        maxPrice: 50
      }
    }
  }
]);

const storeCategories = ref([
  {
    key: 'books',
    name: 'Educational Books',
    description: 'Textbooks, workbooks, and educational reading materials'
  },
  {
    key: 'games',
    name: 'Educational Games',
    description: 'Learning games and interactive educational content'
  },
  {
    key: 'videos',
    name: 'Video Content',
    description: 'Educational videos, tutorials, and documentaries'
  },
  {
    key: 'accessories',
    name: 'Study Accessories',
    description: 'Stationery, calculators, and learning tools'
  },
  {
    key: 'toys',
    name: 'Educational Toys',
    description: 'STEM toys, puzzles, and hands-on learning materials'
  },
  {
    key: 'clothing',
    name: 'School Clothing',
    description: 'Uniforms, school-themed apparel, and accessories'
  }
]);

const ageRatings = ref([
  {
    value: 'age6',
    name: 'Ages 6+',
    description: 'Content suitable for early elementary students'
  },
  {
    value: 'age8',
    name: 'Ages 8+',
    description: 'Content suitable for elementary students'
  },
  {
    value: 'age10',
    name: 'Ages 10+',
    description: 'Content suitable for late elementary students'
  },
  {
    value: 'age12',
    name: 'Ages 12+',
    description: 'Content suitable for middle school students'
  },
  {
    value: 'age14',
    name: 'Ages 14+',
    description: 'Content suitable for high school students'
  }
]);

const selectedChildData = computed(() => {
  return children.value.find((child) => child.id === selectedChild.value) || children.value[0];
});

</script>
