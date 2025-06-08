<template>
  <div class="space-y-6">
    <!-- Profile Header -->
    <div class="bg-white rounded-xl shadow-sm border p-6">
      <div class="flex items-center space-x-6">
        <div class="relative">
          <img
            :src="profile.avatar"
            :alt="profile.name"
            class="w-24 h-24 rounded-full object-cover"
          >
          <button class="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
            <svg
              class="w-4 h-4"
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
        </div>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900">{{ profile.name }}</h1>
          <p class="text-gray-600">{{ profile.email }}</p>
          <p class="text-sm text-gray-500">Parent Account • {{ profile.children.length }} Children</p>
          <div class="flex items-center mt-2">
            <div class="flex items-center text-sm text-green-600">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-2" />
              Active Parent
            </div>
          </div>
        </div>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Edit Profile
        </button>
      </div>
    </div>

    <!-- Family Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="text-center">
          <div class="text-3xl font-bold text-purple-600">${{ stats.totalSpent }}</div>
          <div class="text-sm text-gray-600 mt-1">Total Spent</div>
        </div>
      </div>
    </div>

    <!-- Personal Information -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Personal Information</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <p class="text-gray-900">{{ profile.fullName }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <p class="text-gray-900">{{ profile.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <p class="text-gray-900">{{ profile.phone }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <p class="text-gray-900">{{ profile.address }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
            <p class="text-gray-900">{{ profile.emergencyContact }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
            <p class="text-gray-900">{{ profile.relationship }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Children Overview -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">My Children</h3>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add Child
          </button>
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
                <span class="text-gray-600">School:</span>
                <span class="font-medium">{{ child.school }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Notes Created:</span>
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
                <button class="flex-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded hover:bg-blue-200 transition-colors">
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

    <!-- Family Goals -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Family Learning Goals</h3>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <div v-for="goal in familyGoals" :key="goal.id" class="border rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-gray-900">{{ goal.title }}</h4>
              <span class="text-sm text-gray-500">{{ goal.dueDate }}</span>
            </div>
            <p class="text-sm text-gray-600 mb-3">{{ goal.description }}</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                  <div class="bg-blue-600 h-2 rounded-full" :style="{ width: goal.progress + '%' }" />
                </div>
                <span class="text-sm text-gray-500">{{ goal.progress }}%</span>
              </div>
              <div class="flex -space-x-1">
                <img
                  v-for="participant in goal.participants"
                  :key="participant"
                  :src="'/child' + participant + '-avatar.png'"
                  class="w-6 h-6 rounded-full border-2 border-white"
                >
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

const profile = ref({
  name: 'Sarah Johnson',
  fullName: 'Sarah Michelle Johnson',
  email: 'sarah.johnson@email.com',
  avatar: '/default-avatar.png',
  phone: '+1 (555) 123-4567',
  address: '123 Oak Street, Springfield, IL 62701',
  emergencyContact: 'Michael Johnson - +1 (555) 987-6543',
  relationship: 'Mother',
  children: [
    {
      id: 1,
      name: 'Emma Johnson',
      grade: 'Grade 5',
      age: 10,
      avatar: '/child1-avatar.png',
      isActive: true,
      school: 'Westfield Elementary',
      notesCount: 23,
      studyHours: 45,
      lastActive: '2 hours ago'
    },
    {
      id: 2,
      name: 'Liam Johnson',
      grade: 'Grade 3',
      age: 8,
      avatar: '/child2-avatar.png',
      isActive: false,
      school: 'Westfield Elementary',
      notesCount: 15,
      studyHours: 28,
      lastActive: '1 day ago'
    },
    {
      id: 3,
      name: 'Sophia Johnson',
      grade: 'Grade 7',
      age: 12,
      avatar: '/child3-avatar.png',
      isActive: true,
      school: 'Springfield Middle School',
      notesCount: 31,
      studyHours: 67,
      lastActive: '30 minutes ago'
    }
  ]
});

const stats = ref({
  totalChildren: 3,
  activeToday: 2,
  totalSpent: 189.97
});

const familyGoals = ref([
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
]);
</script>
