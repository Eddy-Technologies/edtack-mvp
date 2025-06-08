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

      <!-- Feature Permissions -->
      <div class="bg-white rounded-xl shadow-sm border">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Feature Permissions</h3>
          <p class="text-gray-600">Control which features {{ selectedChildData.name }} can access</p>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="feature in featurePermissions" :key="feature.key" class="flex items-center justify-between py-3 border-b last:border-b-0">
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ feature.name }}</h4>
                <p class="text-sm text-gray-600">{{ feature.description }}</p>
              </div>
              <button
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4',
                  selectedChildData.permissions.features[feature.key] ? 'bg-blue-600' : 'bg-gray-200'
                ]"
                @click="selectedChildData.permissions.features[feature.key] = !selectedChildData.permissions.features[feature.key]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    selectedChildData.permissions.features[feature.key] ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Filters -->
      <div class="bg-white rounded-xl shadow-sm border">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Content Filters</h3>
          <p class="text-gray-600">Filter inappropriate content and set age-appropriate restrictions</p>
        </div>
        <div class="p-6 space-y-6">
          <!-- Age Appropriate Content -->
          <div>
            <h4 class="font-medium text-gray-900 mb-4">Content Rating</h4>
            <div class="space-y-2">
              <label v-for="rating in contentRatings" :key="rating.value" class="flex items-center">
                <input
                  v-model="selectedChildData.permissions.contentFilter.rating"
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

          <!-- Blocked Keywords -->
          <div class="border-t pt-6">
            <h4 class="font-medium text-gray-900 mb-4">Blocked Keywords</h4>
            <div class="space-y-3">
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="keyword in selectedChildData.permissions.contentFilter.blockedKeywords"
                  :key="keyword"
                  class="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                >
                  {{ keyword }}
                  <button class="ml-2 text-red-600 hover:text-red-800" @click="removeBlockedKeyword(keyword)">
                    <svg
                      class="w-3 h-3"
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
                </span>
              </div>
              <div class="flex space-x-2">
                <input
                  v-model="newKeyword"
                  type="text"
                  placeholder="Add keyword to block"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @keyup.enter="addBlockedKeyword"
                >
                <button
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  @click="addBlockedKeyword"
                >
                  Block
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Spending Limits -->
      <div class="bg-white rounded-xl shadow-sm border">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Spending Limits</h3>
          <p class="text-gray-600">Control how {{ selectedChildData.name }} can spend credits and make purchases</p>
        </div>
        <div class="p-6 space-y-6">
          <!-- Monthly Spending Limit -->
          <div>
            <h4 class="font-medium text-gray-900 mb-4">Monthly Spending Limit</h4>
            <div class="flex items-center space-x-3">
              <span class="text-gray-700">$</span>
              <input
                v-model="selectedChildData.permissions.spending.monthlyLimit"
                type="number"
                min="0"
                max="500"
                class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <span class="text-gray-600">per month</span>
            </div>
          </div>

          <!-- Purchase Approval -->
          <div class="border-t pt-6">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium text-gray-900">Require Purchase Approval</h4>
                <p class="text-sm text-gray-600">All purchases must be approved by parent</p>
              </div>
              <button
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  selectedChildData.permissions.spending.requireApproval ? 'bg-blue-600' : 'bg-gray-200'
                ]"
                @click="selectedChildData.permissions.spending.requireApproval = !selectedChildData.permissions.spending.requireApproval"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    selectedChildData.permissions.spending.requireApproval ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
            </div>
          </div>

          <!-- Credit Allowance -->
          <div class="border-t pt-6">
            <h4 class="font-medium text-gray-900 mb-4">Weekly Credit Allowance</h4>
            <div class="flex items-center space-x-3">
              <input
                v-model="selectedChildData.permissions.spending.weeklyCredits"
                type="number"
                min="0"
                max="1000"
                class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <span class="text-gray-600">credits per week</span>
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
const newKeyword = ref('');
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
      features: {
        aiAssistant: true,
        socialFeatures: false,
        videoContent: true,
        downloadContent: true,
        shareNotes: false,
        exportData: false,
        thirdPartyIntegrations: false
      },
      contentFilter: {
        rating: 'age10',
        blockedKeywords: ['violence', 'inappropriate']
      },
      spending: {
        monthlyLimit: 25,
        requireApproval: true,
        weeklyCredits: 100
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
      features: {
        aiAssistant: false,
        socialFeatures: false,
        videoContent: true,
        downloadContent: false,
        shareNotes: false,
        exportData: false,
        thirdPartyIntegrations: false
      },
      contentFilter: {
        rating: 'age8',
        blockedKeywords: ['violence', 'scary', 'inappropriate']
      },
      spending: {
        monthlyLimit: 15,
        requireApproval: true,
        weeklyCredits: 50
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
      features: {
        aiAssistant: true,
        socialFeatures: true,
        videoContent: true,
        downloadContent: true,
        shareNotes: true,
        exportData: true,
        thirdPartyIntegrations: false
      },
      contentFilter: {
        rating: 'age12',
        blockedKeywords: ['inappropriate']
      },
      spending: {
        monthlyLimit: 50,
        requireApproval: false,
        weeklyCredits: 200
      }
    }
  }
]);

const featurePermissions = ref([
  {
    key: 'aiAssistant',
    name: 'AI Study Assistant',
    description: 'Access to AI-powered homework help and tutoring'
  },
  {
    key: 'socialFeatures',
    name: 'Social Features',
    description: 'Chat with friends and join study groups'
  },
  {
    key: 'videoContent',
    name: 'Video Content',
    description: 'Watch educational videos and tutorials'
  },
  {
    key: 'downloadContent',
    name: 'Download Content',
    description: 'Download notes and materials for offline use'
  },
  {
    key: 'shareNotes',
    name: 'Share Notes',
    description: 'Share notes and assignments with classmates'
  },
  {
    key: 'exportData',
    name: 'Export Data',
    description: 'Export personal data and study materials'
  },
  {
    key: 'thirdPartyIntegrations',
    name: 'Third-party Integrations',
    description: 'Connect with external educational tools and platforms'
  }
]);

const contentRatings = ref([
  {
    value: 'age6',
    name: 'Ages 6+',
    description: 'Suitable for early elementary students'
  },
  {
    value: 'age8',
    name: 'Ages 8+',
    description: 'Suitable for elementary students'
  },
  {
    value: 'age10',
    name: 'Ages 10+',
    description: 'Suitable for late elementary students'
  },
  {
    value: 'age12',
    name: 'Ages 12+',
    description: 'Suitable for middle school students'
  },
  {
    value: 'age14',
    name: 'Ages 14+',
    description: 'Suitable for high school students'
  }
]);

const selectedChildData = computed(() => {
  return children.value.find((child) => child.id === selectedChild.value) || children.value[0];
});

const addBlockedKeyword = () => {
  if (newKeyword.value.trim() && !selectedChildData.value.permissions.contentFilter.blockedKeywords.includes(newKeyword.value.trim())) {
    selectedChildData.value.permissions.contentFilter.blockedKeywords.push(newKeyword.value.trim());
    newKeyword.value = '';
  }
};

const removeBlockedKeyword = (keyword: string) => {
  const index = selectedChildData.value.permissions.contentFilter.blockedKeywords.indexOf(keyword);
  if (index > -1) {
    selectedChildData.value.permissions.contentFilter.blockedKeywords.splice(index, 1);
  }
};
</script>
