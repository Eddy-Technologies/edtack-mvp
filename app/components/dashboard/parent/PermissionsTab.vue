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
          :key="child.child_id"
          :class="[
            'p-4 border rounded-lg transition-colors text-left',
            selectedChildId === child.child_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          ]"
          @click="selectedChildId = child.child_id"
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

    <div v-if="selectedChildId && selectedChildData && selectedChildPermissions" class="space-y-6">
      <!-- Store Access & Permissions -->
      <div class="bg-white rounded-xl shadow-sm border">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Store Access & Permissions</h3>
          <p class="text-gray-600">Control {{ selectedChildData.name }}'s store access and purchase permissions</p>
        </div>
        <div class="p-6 space-y-6">
          <!-- Store Access Toggle -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div>
                <h4 class="font-medium text-gray-900">Store Access</h4>
                <p class="text-sm text-gray-600">Allow access to the store</p>
              </div>
              <div v-if="loadingStates.access_to_store" class="flex items-center">
                <svg class="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            </div>
            <button
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                selectedChildPermissions.access_to_store ? 'bg-blue-600' : 'bg-gray-200'
              ]"
              :disabled="loadingStates.access_to_store"
              @click="updatePermission('access_to_store', !selectedChildPermissions.access_to_store)"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  selectedChildPermissions.access_to_store ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>

          <div v-if="selectedChildPermissions.access_to_store" class="space-y-6 border-t pt-6">
            <!-- Store Category Permissions -->
            <div>
              <h4 class="font-medium text-gray-900 mb-4">Store Categories</h4>
              <div class="space-y-4">
                <!-- Video Games Permission -->
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div>
                      <h5 class="font-medium text-gray-900">Video Games</h5>
                      <p class="text-sm text-gray-600">Allow purchasing video games and gaming content</p>
                    </div>
                    <div v-if="loadingStates.allow_video_games" class="flex items-center">
                      <svg class="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  </div>
                  <button
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      selectedChildPermissions.allow_video_games ? 'bg-blue-600' : 'bg-gray-200'
                    ]"
                    :disabled="loadingStates.allow_video_games"
                    @click="updatePermission('allow_video_games', !selectedChildPermissions.allow_video_games)"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        selectedChildPermissions.allow_video_games ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>

                <!-- Toys Permission -->
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div>
                      <h5 class="font-medium text-gray-900">Toys & Educational Items</h5>
                      <p class="text-sm text-gray-600">Allow purchasing toys and educational materials</p>
                    </div>
                    <div v-if="loadingStates.allow_toys" class="flex items-center">
                      <svg class="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  </div>
                  <button
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      selectedChildPermissions.allow_toys ? 'bg-blue-600' : 'bg-gray-200'
                    ]"
                    :disabled="loadingStates.allow_toys"
                    @click="updatePermission('allow_toys', !selectedChildPermissions.allow_toys)"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        selectedChildPermissions.allow_toys ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>
              </div>
            </div>

            <!-- Price Limit -->
            <div class="border-t pt-6">
              <h4 class="font-medium text-gray-900 mb-4">Purchase Limits</h4>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-2">Item Price Limit</label>
                <div class="flex items-center space-x-4">
                  <span class="text-gray-700">$</span>
                  <input
                    v-model.number="selectedChildPermissions.item_price_limit"
                    type="number"
                    min="0"
                    max="1000"
                    step="5"
                    class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    :disabled="loadingStates.item_price_limit"
                    @blur="updatePermission('item_price_limit', selectedChildPermissions.item_price_limit)"
                    @keyup.enter="updatePermission('item_price_limit', selectedChildPermissions.item_price_limit)"
                  >
                  <span class="text-gray-600">per item</span>
                  <div v-if="loadingStates.item_price_limit" class="flex items-center">
                    <svg class="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">Maximum amount that can be spent on a single item</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Screen Time Controls -->
      <div class="bg-white rounded-xl shadow-sm border">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Screen Time Controls</h3>
          <p class="text-gray-600">Set daily limits and time restrictions for {{ selectedChildData.name }}</p>
        </div>
        <div class="p-6 space-y-6">
          <!-- Daily Screen Time Limits -->
          <div>
            <h4 class="font-medium text-gray-900 mb-4">Daily Screen Time Limits</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-2">Weekdays (Mon-Fri)</label>
                <div class="flex items-center space-x-3">
                  <input
                    v-model.number="selectedChildPermissions.weekday_screen_time_limit"
                    type="range"
                    min="0"
                    max="8"
                    step="0.5"
                    class="flex-1"
                    :disabled="loadingStates.weekday_screen_time_limit"
                    @change="updatePermission('weekday_screen_time_limit', selectedChildPermissions.weekday_screen_time_limit)"
                  >
                  <span class="text-sm text-gray-600 w-16">{{ selectedChildPermissions.weekday_screen_time_limit }}h</span>
                  <div v-if="loadingStates.weekday_screen_time_limit" class="flex items-center">
                    <svg class="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-2">Weekends (Sat-Sun)</label>
                <div class="flex items-center space-x-3">
                  <input
                    v-model.number="selectedChildPermissions.weekend_screen_time_limit"
                    type="range"
                    min="0"
                    max="12"
                    step="0.5"
                    class="flex-1"
                    :disabled="loadingStates.weekend_screen_time_limit"
                    @change="updatePermission('weekend_screen_time_limit', selectedChildPermissions.weekend_screen_time_limit)"
                  >
                  <span class="text-sm text-gray-600 w-16">{{ selectedChildPermissions.weekend_screen_time_limit }}h</span>
                  <div v-if="loadingStates.weekend_screen_time_limit" class="flex items-center">
                    <svg class="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Time Restrictions -->
          <div class="border-t pt-6">
            <h4 class="font-medium text-gray-900 mb-4">Allowed Usage Hours (Weekdays)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center space-x-3 mb-2">
                  <label class="block text-sm font-medium text-gray-700">Start Time</label>
                  <div v-if="loadingStates.weekday_screen_time_start" class="flex items-center">
                    <svg class="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                </div>
                <input
                  v-model="selectedChildPermissions.weekday_screen_time_start"
                  type="time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  :disabled="loadingStates.weekday_screen_time_start"
                  @change="updatePermission('weekday_screen_time_start', selectedChildPermissions.weekday_screen_time_start)"
                >
                <p class="text-xs text-gray-500 mt-1">When access is allowed to begin</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center space-x-3 mb-2">
                  <label class="block text-sm font-medium text-gray-700">End Time</label>
                  <div v-if="loadingStates.weekday_screen_time_end" class="flex items-center">
                    <svg class="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                </div>
                <input
                  v-model="selectedChildPermissions.weekday_screen_time_end"
                  type="time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  :disabled="loadingStates.weekday_screen_time_end"
                  @change="updatePermission('weekday_screen_time_end', selectedChildPermissions.weekday_screen_time_end)"
                >
                <p class="text-xs text-gray-500 mt-1">When access must end</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reset to Default -->
      <div class="flex justify-end">
        <button
          class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          @click="resetToDefault"
        >
          Reset to Default
        </button>
      </div>
    </div>

    <!-- No Child Selected -->
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
      <p class="text-gray-600">Add children to your account to manage their permissions.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// Interface matching your StudentPermissionRes
interface StudentPermissionRes {
  child_id: string;
  access_to_store: boolean;
  allow_video_games: boolean;
  allow_toys: boolean;
  item_price_limit: number;
  weekday_screen_time_limit: number;
  weekend_screen_time_limit: number;
  weekday_screen_time_start: string;
  weekday_screen_time_end: string;
}

interface Child {
  child_id: string;
  name: string;
  grade: string;
  avatar: string;
}

const selectedChildId = ref<string>('child1');

// Loading states for each permission field
const loadingStates = ref<Record<string, boolean>>({
  access_to_store: false,
  allow_video_games: false,
  allow_toys: false,
  item_price_limit: false,
  weekday_screen_time_limit: false,
  weekend_screen_time_limit: false,
  weekday_screen_time_start: false,
  weekday_screen_time_end: false
});

// Sample children data
const children = ref<Child[]>([
  {
    child_id: 'child1',
    name: 'Emma Johnson',
    grade: 'Grade 5',
    avatar: '/boy.png'
  },
  {
    child_id: 'child2',
    name: 'Liam Johnson',
    grade: 'Grade 3',
    avatar: '/girl.png'
  },
  {
    child_id: 'child3',
    name: 'Sophia Johnson',
    grade: 'Grade 7',
    avatar: '/child.png'
  }
]);

// Sample permissions data matching your interface
const childrenPermissions = ref<Record<string, StudentPermissionRes>>({
  child1: {
    child_id: 'child1',
    access_to_store: true,
    allow_video_games: true,
    allow_toys: true,
    item_price_limit: 25,
    weekday_screen_time_limit: 3,
    weekend_screen_time_limit: 5,
    weekday_screen_time_start: '08:00',
    weekday_screen_time_end: '19:00'
  },
  child2: {
    child_id: 'child2',
    access_to_store: true,
    allow_video_games: false,
    allow_toys: true,
    item_price_limit: 15,
    weekday_screen_time_limit: 2,
    weekend_screen_time_limit: 3.5,
    weekday_screen_time_start: '09:00',
    weekday_screen_time_end: '18:00'
  },
  child3: {
    child_id: 'child3',
    access_to_store: true,
    allow_video_games: true,
    allow_toys: false,
    item_price_limit: 50,
    weekday_screen_time_limit: 4,
    weekend_screen_time_limit: 6,
    weekday_screen_time_start: '07:00',
    weekday_screen_time_end: '21:00'
  }
});

const selectedChildData = computed(() => {
  return children.value.find((child) => child.child_id === selectedChildId.value);
});

const selectedChildPermissions = computed(() => {
  if (!selectedChildId.value) return null;
  return childrenPermissions.value[selectedChildId.value];
});

// Update a specific permission with API call
const updatePermission = async (field: keyof StudentPermissionRes, value: any) => {
  if (!selectedChildId.value || !selectedChildPermissions.value) return;

  // Set loading state for this field
  loadingStates.value[field] = true;

  try {
    // Update the local state first for immediate UI feedback
    (selectedChildPermissions.value as any)[field] = value;

    // Simulate API call - replace with your actual API endpoint
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay

    // Here you would make the actual API call
    // const response = await fetch(`/api/child-permissions/${selectedChildId.value}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ [field]: value })
    // });
    //
    // if (!response.ok) throw new Error('Failed to update permission');

    console.log(`Updated ${field} to ${value} for child:`, selectedChildId.value);
  } catch (error) {
    console.error('Error updating permission:', error);
    // Revert the change on error
    // You might want to show a toast notification here instead of alert
    alert('Failed to update permission. Please try again.');
  } finally {
    // Clear loading state
    loadingStates.value[field] = false;
  }
};

const resetToDefault = async () => {
  if (!selectedChildId.value) return;

  // Set loading for all fields
  Object.keys(loadingStates.value).forEach((key) => {
    loadingStates.value[key] = true;
  });

  try {
    // Reset to default values
    const defaultPermissions = {
      child_id: selectedChildId.value,
      access_to_store: true,
      allow_video_games: false,
      allow_toys: true,
      item_price_limit: 20,
      weekday_screen_time_limit: 2,
      weekend_screen_time_limit: 4,
      weekday_screen_time_start: '08:00',
      weekday_screen_time_end: '19:00'
    };

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update local state
    childrenPermissions.value[selectedChildId.value] = defaultPermissions;

    console.log('Reset permissions to default for child:', selectedChildId.value);
  } catch (error) {
    console.error('Error resetting permissions:', error);
    alert('Failed to reset permissions. Please try again.');
  } finally {
    // Clear all loading states
    Object.keys(loadingStates.value).forEach((key) => {
      loadingStates.value[key] = false;
    });
  }
};

// Clear loading states when child selection changes
watch(selectedChildId, () => {
  Object.keys(loadingStates.value).forEach((key) => {
    loadingStates.value[key] = false;
  });
});
</script>
