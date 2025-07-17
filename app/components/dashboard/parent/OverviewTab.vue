<template>
  <div class="space-y-6">
    <!-- Overview Header -->
    <OverviewHeader />

    <!-- Family Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">{{ stats.totalChildren }}</div>
          <div class="text-sm text-gray-600 mt-1">Children</div>
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
          <h3 class="text-lg font-semibold text-gray-900">My Children</h3>
        </div>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="child in profile.children" :key="child.id" class="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center space-x-3 mb-4">
              <img :src="child.avatar" :alt="child.name" class="w-12 h-12 rounded-full">
              <div>
                <h4 class="font-semibold text-gray-900">{{ child.name }}</h4>
                <p class="text-sm text-gray-600">{{ child.grade }} • Age {{ child.age }}</p>
              </div>
              <div class="ml-auto">
                <div
                  :class="[
                    'w-3 h-3 rounded-full',
                    child.isActive ? 'bg-green-400' : 'bg-gray-300'
                  ]"
                />
              </div>
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Assignments Completed:</span>
                <span class="font-medium">{{ child.notesCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Study Hours:</span>
                <span class="font-medium">{{ child.studyHours }}h</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Last Active:</span>
                <span class="font-medium">{{ child.lastActive }}</span>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t">
              <div class="flex space-x-2">
                <button class="flex-1 px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded hover:bg-primary-200 transition-colors">
                  View Progress
                </button>
                <button class="flex-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import OverviewHeader from '../OverviewHeader.vue';
import { useDashboardData } from '~/composables/useDashboardData';

const { dashboardData, shopChildrenData } = useDashboardData();

// Get data from API with fallbacks
const profile = computed(() => {
  const user = dashboardData.value && 'user' in dashboardData.value ? dashboardData.value.user : null;
  const profileData = dashboardData.value && 'profile' in dashboardData.value ? dashboardData.value.profile : null;
  const children = shopChildrenData.value?.children || [];

  return {
    name: user?.name || 'User Name',
    fullName: profileData ? `${profileData.firstName} ${profileData.lastName}` : 'User Name',
    email: user?.email || 'user@example.com',
    avatar: user?.avatar || '/default-avatar.png',
    phone: profileData?.phone || '+1 (555) 123-4567',
    address: '123 Oak Street, Springfield, IL 62701', // This could come from billing address
    emergencyContact: 'Emergency Contact - +1 (555) 987-6543',
    relationship: 'Parent',
    children: children.map((child: any) => ({
      id: child.id,
      name: child.name,
      grade: child.grade,
      age: calculateAge(child.grade),
      avatar: child.avatar,
      isActive: child.status === 'Active',
      school: getSchoolFromGrade(child.grade),
      notesCount: Math.floor(Math.random() * 50) + 10, // Mock data for now
      studyHours: Math.floor(Math.random() * 100) + 20, // Mock data for now
      lastActive: getRandomLastActive()
    }))
  };
});

const stats = computed(() => {
  const familyStats = dashboardData.value && 'familyStats' in dashboardData.value ? dashboardData.value.familyStats : null;

  return {
    totalChildren: familyStats?.totalChildren || profile.value.children.length,
    activeToday: profile.value.children.filter((child: any) => child.isActive).length,
    totalSpent: 189.97 // This could come from billing history
  };
});

// Get family goals from API
const familyGoals = computed(() => {
  return shopChildrenData.value?.familyGoals || [
    {
      id: 1,
      title: 'Improve Math Grades',
      description: 'Help all children achieve at least a B+ in mathematics this semester',
      dueDate: 'End of Term',
      progress: 75,
      participants: [1, 2, 3]
    },
    {
      id: 2,
      title: 'Daily Reading Habit',
      description: 'Read for at least 30 minutes every day',
      dueDate: 'Ongoing',
      progress: 60,
      participants: [1, 2]
    },
    {
      id: 3,
      title: 'Science Fair Project',
      description: 'Complete science fair projects for Sophia and Emma',
      dueDate: 'March 15, 2024',
      progress: 40,
      participants: [1, 3]
    }
  ];
});

// Helper functions
const calculateAge = (grade: string): number => {
  const gradeNumber = parseInt(grade.replace(/\D/g, ''));
  return gradeNumber + 5; // Rough calculation
};

const getSchoolFromGrade = (grade: string): string => {
  const gradeNumber = parseInt(grade.replace(/\D/g, ''));
  if (gradeNumber <= 5) return 'Westfield Elementary';
  if (gradeNumber <= 8) return 'Springfield Middle School';
  return 'Springfield High School';
};

const getRandomLastActive = (): string => {
  const options = ['2 hours ago', '1 day ago', '30 minutes ago', '3 hours ago', '6 hours ago'];
  return options[Math.floor(Math.random() * options.length)];
};
</script>
