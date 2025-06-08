<template>
  <div class="space-y-6">
    <!-- Account Settings Header -->
    <div class="bg-white rounded-xl shadow-sm border p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Account Settings</h2>
      <p class="text-gray-600">Manage your account preferences and security settings</p>
    </div>

    <!-- Personal Information -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Personal Information</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              v-model="personalInfo.firstName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              v-model="personalInfo.lastName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              v-model="personalInfo.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              v-model="personalInfo.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input
              v-model="personalInfo.dateOfBirth"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
            <select
              v-model="personalInfo.grade"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="grade in grades" :key="grade" :value="grade">{{ grade }}</option>
            </select>
          </div>
        </div>
        <div class="mt-6">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Security Settings -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Security Settings</h3>
      </div>
      <div class="p-6 space-y-6">
        <!-- Change Password -->
        <div>
          <h4 class="font-medium text-gray-900 mb-4">Change Password</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                v-model="passwordForm.current"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                v-model="passwordForm.new"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                v-model="passwordForm.confirm"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Update Password
            </button>
          </div>
        </div>

        <!-- Two-Factor Authentication -->
        <div class="border-t pt-6">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p class="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                security.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
              ]"
              @click="security.twoFactorEnabled = !security.twoFactorEnabled"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
        </div>

        <!-- Login Sessions -->
        <div class="border-t pt-6">
          <h4 class="font-medium text-gray-900 mb-4">Active Sessions</h4>
          <div class="space-y-3">
            <div v-for="session in sessions" :key="session.id" class="flex items-center justify-between p-4 border rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    class="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ session.device }}</p>
                  <p class="text-sm text-gray-600">{{ session.location }} • {{ session.lastActive }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span v-if="session.current" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Current</span>
                <button v-else class="text-red-600 hover:text-red-700 text-sm">Revoke</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preferences -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Preferences</h3>
      </div>
      <div class="p-6 space-y-6">
        <!-- Notifications -->
        <div>
          <h4 class="font-medium text-gray-900 mb-4">Notifications</h4>
          <div class="space-y-3">
            <div v-for="notification in notifications" :key="notification.key" class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">{{ notification.label }}</p>
                <p class="text-sm text-gray-600">{{ notification.description }}</p>
              </div>
              <button
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  notification.enabled ? 'bg-blue-600' : 'bg-gray-200'
                ]"
                @click="notification.enabled = !notification.enabled"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    notification.enabled ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Theme -->
        <div class="border-t pt-6">
          <h4 class="font-medium text-gray-900 mb-4">Theme</h4>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="theme in themes"
              :key="theme.value"
              :class="[
                'p-3 border rounded-lg text-center transition-colors',
                preferences.theme === theme.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              ]"
              @click="preferences.theme = theme.value"
            >
              <div class="text-2xl mb-1">{{ theme.icon }}</div>
              <div class="text-sm font-medium">{{ theme.label }}</div>
            </button>
          </div>
        </div>

        <!-- Language -->
        <div class="border-t pt-6">
          <h4 class="font-medium text-gray-900 mb-4">Language</h4>
          <select
            v-model="preferences.language"
            class="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="language in languages" :key="language.code" :value="language.code">
              {{ language.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="bg-white rounded-xl shadow-sm border border-red-200">
      <div class="p-6 border-b border-red-200">
        <h3 class="text-lg font-semibold text-red-900">Danger Zone</h3>
        <p class="text-red-600">Irreversible and destructive actions</p>
      </div>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between p-4 border border-red-200 rounded-lg">
          <div>
            <h4 class="font-medium text-red-900">Delete Account</h4>
            <p class="text-sm text-red-600">Permanently delete your account and all associated data</p>
          </div>
          <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const personalInfo = ref({
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'alex.johnson@student.edu',
  phone: '+1 (555) 123-4567',
  dateOfBirth: '2010-03-15',
  grade: 'Grade 8'
});

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
});
const security = ref({
  twoFactorEnabled: false
});

const preferences = ref({
  theme: 'system',
  language: 'en'
});

const grades = ref([
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
]);

const sessions = ref([
  {
    id: 1,
    device: 'MacBook Pro',
    location: 'San Francisco, CA',
    lastActive: '2 minutes ago',
    current: true
  },
  {
    id: 2,
    device: 'iPhone 14',
    location: 'San Francisco, CA',
    lastActive: '1 hour ago',
    current: false
  },
  {
    id: 3,
    device: 'iPad Air',
    location: 'San Francisco, CA',
    lastActive: '2 days ago',
    current: false
  }
]);

const notifications = ref([
  {
    key: 'email',
    label: 'Email Notifications',
    description: 'Receive notifications via email',
    enabled: true
  },
  {
    key: 'push',
    label: 'Push Notifications',
    description: 'Receive push notifications on your devices',
    enabled: true
  },
  {
    key: 'assignments',
    label: 'Assignment Reminders',
    description: 'Get reminders about upcoming assignments',
    enabled: true
  },
  {
    key: 'grades',
    label: 'Grade Updates',
    description: 'Notifications when grades are posted',
    enabled: false
  },
  {
    key: 'marketing',
    label: 'Marketing Emails',
    description: 'Receive updates about new features and promotions',
    enabled: false
  }
]);

const themes = ref([
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '💻' }
]);

const languages = ref([
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' }
]);
</script>
