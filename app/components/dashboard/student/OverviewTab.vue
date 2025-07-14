<template>
  <div class="space-y-6">
    <!-- Overview Header -->
    <div class="bg-white rounded-xl shadow-sm border p-6">
      <div class="flex items-center space-x-6">
        <div class="relative">
          <img
            :src="profile.avatar"
            :alt="profile.name"
            class="w-24 h-24 rounded-full object-cover"
          />
          <button
            class="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <p class="text-sm text-gray-500">
            Grade {{ profile.grade }} • Student ID: {{ profile.studentId }}
          </p>
          <div class="flex items-center mt-2">
            <div class="flex items-center text-sm text-green-600">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-2" />
              Online
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">{{ stats.totalStudyHours }}</div>
          <div class="text-sm text-gray-600 mt-1">Total Study Hours</div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600">{{ stats.completionRate }}%</div>
          <div class="text-sm text-gray-600 mt-1">Completion Rate</div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="text-center">
          <div class="text-3xl font-bold text-purple-600">{{ stats.rank }}</div>
          <div class="text-sm text-gray-600 mt-1">Class Rank</div>
        </div>
      </div>
    </div>

    <!-- Subject Preferences -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Subject Preferences</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="subject in subjects" :key="subject.name" class="text-center">
            <div
              class="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-2"
              :style="{ backgroundColor: subject.color + '20', color: subject.color }"
            >
              {{ subject.emoji }}
            </div>
            <p class="text-sm font-medium text-gray-900">{{ subject.name }}</p>
            <p class="text-xs text-gray-500">{{ subject.level }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import placeholder1 from '../../../../assets/eddy.png';

const profile = ref({
  name: 'Alex Johnson',
  fullName: 'Alexander James Johnson',
  email: 'alex.johnson@student.edu',
  avatar: placeholder1,
  grade: '8',
  studentId: 'ST2024-8A-001',
  dateOfBirth: 'March 15, 2010',
  school: 'Westfield Middle School',
  parentName: 'Sarah Johnson',
  emergencyContact: '+1 (555) 123-4567',
  learningStyle: 'Visual & Kinesthetic',
});

const stats = ref({
  totalStudyHours: 342,
  completionRate: 87,
  rank: 3,
});

const subjects = ref([
  { name: 'Mathematics', emoji: '🔢', level: 'Advanced', color: '#3B82F6' },
  { name: 'Science', emoji: '🔬', level: 'Grade Level', color: '#10B981' },
  { name: 'English', emoji: '📚', level: 'Advanced', color: '#8B5CF6' },
  { name: 'History', emoji: '🏛️', level: 'Grade Level', color: '#F59E0B' },
  { name: 'Art', emoji: '🎨', level: 'Beginner', color: '#EF4444' },
  { name: 'Music', emoji: '🎵', level: 'Intermediate', color: '#06B6D4' },
  { name: 'Physical Ed', emoji: '⚽', level: 'Grade Level', color: '#84CC16' },
  { name: 'Technology', emoji: '💻', level: 'Advanced', color: '#6366F1' },
]);
</script>
