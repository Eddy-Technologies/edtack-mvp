<template>
  <div class="space-y-6">
    <!-- Overview Header -->
    <OverviewHeader :show-edit-button="true" />

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
import OverviewHeader from '../OverviewHeader.vue';

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
