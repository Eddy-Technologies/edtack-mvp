<template>
  <div class="space-y-6">
    <!-- Overview Header -->
    <OverviewHeader />

    <!-- Parent View: Family Overview -->
    <template v-if="isParent">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ stats.totalChildren }}</div>
            <div class="text-sm text-gray-600 mt-1">Total Students</div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ stats.activeToday }}</div>
            <div class="text-sm text-gray-600 mt-1">Active Today</div>
          </div>
        </div>
      </div>

      <!-- Children Overview -->
      <div class="bg-white rounded-xl shadow-sm border">
        <div class="p-6 border-b">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Student Overview</h3>
          </div>
        </div>
        <div class="p-6">
          <div v-if="familyMembers.length === 0" class="text-center py-12">
            <div class="flex items-center justify-center w-16 h-16 mx-auto text-gray-300 mb-4">
              <UIcon name="i-lucide-users" size="64" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No students in your family yet</h3>
            <p class="text-gray-500 mb-6">Invite students to your family group to see their progress here.</p>
            <NuxtLink to="/dashboard?tab=family">
              <Button variant="primary" text="Manage Family" icon="i-lucide-users" />
            </NuxtLink>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="student in familyMembers" :key="student.id" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex items-center space-x-3 mb-4">
                <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                  <span class="text-blue-700 font-medium">{{ getInitials(student.userDisplayFullName || student.email) }}</span>
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900">{{ student.userDisplayFullName || student.email }}</h4>
                  <p class="text-sm text-gray-600">Student Account</p>
                </div>
                <div class="ml-auto">
                  <div
                    :class="[
                      'w-3 h-3 rounded-full',
                      student.isActive ? 'bg-green-400' : 'bg-gray-300'
                    ]"
                  />
                </div>
              </div>

              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Credits:</span>
                  <span class="font-medium text-green-600">{{ student.credits || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Active Tasks:</span>
                  <span class="font-medium">{{ student.activeTasks || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Joined:</span>
                  <span class="font-medium">{{ formatDate(student.joined_at) }}</span>
                </div>
              </div>

              <div class="mt-4 pt-3 border-t">
                <div class="flex space-x-2">
                  <NuxtLink :to="`/dashboard?tab=family`" class="flex-1">
                    <button class="w-full px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded hover:bg-primary-200 transition-colors">
                      View Details
                    </button>
                  </NuxtLink>
                  <NuxtLink to="/dashboard?tab=tasks" class="flex-1">
                    <button class="w-full px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors">
                      Manage Tasks
                    </button>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Student View: Personal Overview -->
    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border">
          <div class="text-center">
            <div class="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
              <UIcon name="i-lucide-coins" class="text-green-600" size="24" />
            </div>
            <div class="text-3xl font-bold text-green-600">{{ userCredits }}</div>
            <div class="text-sm text-gray-600 mt-1">Available Credits</div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border">
          <div class="text-center">
            <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
              <UIcon name="i-lucide-clipboard-list" class="text-blue-600" size="24" />
            </div>
            <div class="text-3xl font-bold text-blue-600">{{ activeTasks }}</div>
            <div class="text-sm text-gray-600 mt-1">Active Tasks</div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm border">
          <div class="text-center">
            <div class="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
              <UIcon name="i-lucide-check-circle" class="text-purple-600" size="24" />
            </div>
            <div class="text-3xl font-bold text-purple-600">{{ completedTasks }}</div>
            <div class="text-sm text-gray-600 mt-1">Completed Tasks</div>
          </div>
        </div>
      </div>

      <!-- Recent Tasks -->
      <div class="bg-white rounded-xl shadow-sm border">
        <div class="p-6 border-b">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Recent Tasks</h3>
            <NuxtLink to="/dashboard?tab=tasks">
              <Button variant="secondary" text="View All" size="sm" />
            </NuxtLink>
          </div>
        </div>
        <div class="p-6">
          <div v-if="recentTasks.length === 0" class="text-center py-8">
            <p class="text-gray-500">No tasks yet. Check with your family to get started!</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="task in recentTasks" :key="task.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    task.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                  ]"
                >
                  <UIcon
                    :name="task.status === 'completed' ? 'i-lucide-check' : 'i-lucide-clock'"
                    :class="task.status === 'completed' ? 'text-green-600' : 'text-blue-600'"
                    size="20"
                  />
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ task.title }}</h4>
                  <p class="text-sm text-gray-600">{{ task.description }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium text-green-600">+{{ task.credits }} credits</p>
                <p class="text-xs text-gray-500">{{ formatDate(task.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NuxtLink to="/dashboard?tab=shop" class="block">
          <div class="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center space-x-4">
              <div class="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full">
                <UIcon name="i-lucide-shopping-bag" class="text-indigo-600" size="24" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Visit Shop</h3>
                <p class="text-sm text-gray-600">Spend your credits on rewards</p>
              </div>
            </div>
          </div>
        </NuxtLink>
        <NuxtLink to="/dashboard?tab=family" class="block">
          <div class="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center space-x-4">
              <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <UIcon name="i-lucide-users" class="text-blue-600" size="24" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">View Family</h3>
                <p class="text-sm text-gray-600">See your family connections</p>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import OverviewHeader from './overview/OverviewHeader.vue';
import { useDashboardData } from '~/composables/useDashboardData';
import { useMeStore } from '~/stores/me';
import Button from '~/components/common/Button.vue';

const { dashboardData, shopChildrenData } = useDashboardData();
const user = useMeStore();

// Check if user is parent
const isParent = computed(() => user.user_role === 'PARENT');

// Family members data
const familyMembers = ref<any[]>([]);
const userCredits = ref(0);
const activeTasks = ref(0);
const completedTasks = ref(0);
const recentTasks = ref<any[]>([]);

// Load family data for parents or personal data for students
onMounted(async () => {
  try {
    if (isParent.value) {
      // Load family members for parent
      const response = await $fetch('/api/family/list');
      if (response.success) {
        familyMembers.value = response.familyMembers?.filter((member: any) => member.status === 'active') || [];
      }
    } else {
      // Load student's personal data
      // Load credits
      const creditsResponse = await $fetch('/api/credits/unified');
      userCredits.value = creditsResponse.balance || 0;

      // Load tasks data from API (when available)
      // For now, these will remain 0 until proper API endpoints are created
      activeTasks.value = 0;
      completedTasks.value = 0;
      recentTasks.value = [];
    }
  } catch (error) {
    console.error('Failed to load overview data:', error);
  }
});


const stats = computed(() => {
  return {
    totalChildren: familyMembers.value.length,
    activeToday: familyMembers.value.filter((member: any) => member.isActive).length
  };
});


// Helper functions
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
</script>
