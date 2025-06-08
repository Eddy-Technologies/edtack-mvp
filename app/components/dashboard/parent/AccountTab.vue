<template>
  <div class="space-y-6">
    <!-- Account Settings Header -->
    <div class="bg-white rounded-xl shadow-sm border p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Parent Account Settings</h2>
      <p class="text-gray-600">Manage your account and family settings</p>
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
            <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              v-model="personalInfo.address"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
            <input
              v-model="personalInfo.emergencyContact"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>
        <div class="mt-6">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Family Management -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Family Management</h3>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add Child
          </button>
        </div>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <div v-for="child in familyMembers" :key="child.id" class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center space-x-4">
              <img :src="child.avatar" :alt="child.name" class="w-12 h-12 rounded-full">
              <div>
                <h4 class="font-medium text-gray-900">{{ child.name }}</h4>
                <p class="text-sm text-gray-600">{{ child.grade }} • Age {{ child.age }}</p>
                <p class="text-xs text-gray-500">{{ child.school }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <span
                :class="[
                  'px-2 py-1 text-xs font-semibold rounded-full',
                  child.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ child.status }}
              </span>
              <button class="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
              <button class="text-red-600 hover:text-red-700 text-sm">Remove</button>
            </div>
          </div>
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

        <!-- PIN for Child Accounts -->
        <div class="border-t pt-6">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">Parental PIN</h4>
              <p class="text-sm text-gray-600">Required for sensitive actions and settings changes</p>
            </div>
            <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Change PIN
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Preferences -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Notification Preferences</h3>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <div v-for="notification in notificationSettings" :key="notification.key" class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">{{ notification.label }}</h4>
              <p class="text-sm text-gray-600">{{ notification.description }}</p>
            </div>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input
                  v-model="notification.email"
                  type="checkbox"
                  class="mr-2 text-blue-600"
                >
                <span class="text-sm text-gray-700">Email</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="notification.push"
                  type="checkbox"
                  class="mr-2 text-blue-600"
                >
                <span class="text-sm text-gray-700">Push</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="notification.sms"
                  type="checkbox"
                  class="mr-2 text-blue-600"
                >
                <span class="text-sm text-gray-700">SMS</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Privacy Settings -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Privacy Settings</h3>
      </div>
      <div class="p-6 space-y-6">
        <!-- Data Sharing -->
        <div>
          <h4 class="font-medium text-gray-900 mb-4">Data Sharing Preferences</h4>
          <div class="space-y-3">
            <div v-for="privacy in privacySettings" :key="privacy.key" class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">{{ privacy.label }}</p>
                <p class="text-sm text-gray-600">{{ privacy.description }}</p>
              </div>
              <button
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  privacy.enabled ? 'bg-blue-600' : 'bg-gray-200'
                ]"
                @click="privacy.enabled = !privacy.enabled"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    privacy.enabled ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- Data Export -->
        <div class="border-t pt-6">
          <h4 class="font-medium text-gray-900 mb-4">Data Management</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h5 class="font-medium text-gray-900">Export Family Data</h5>
              <p class="text-sm text-gray-600 mt-1">Download all family data and reports</p>
            </button>
            <button class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h5 class="font-medium text-gray-900">Request Data Deletion</h5>
              <p class="text-sm text-gray-600 mt-1">Permanently delete all family data</p>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Billing Information -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Billing Information</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
            <textarea
              v-model="billingInfo.address"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tax ID (if applicable)</label>
            <input
              v-model="billingInfo.taxId"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>
        <div class="mt-6">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Update Billing Info
          </button>
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
            <h4 class="font-medium text-red-900">Delete Family Account</h4>
            <p class="text-sm text-red-600">Permanently delete your account and all children's data</p>
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
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+1 (555) 123-4567',
  address: '123 Oak Street, Springfield, IL 62701',
  emergencyContact: '+1 (555) 987-6543'
});

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
});

const security = ref({
  twoFactorEnabled: true
});

const billingInfo = ref({
  address: '123 Oak Street\nSpringfield, IL 62701\nUnited States',
  taxId: ''
});

const familyMembers = ref([
  {
    id: 1,
    name: 'Emma Johnson',
    grade: 'Grade 5',
    age: 10,
    school: 'Westfield Elementary',
    avatar: '/child1-avatar.png',
    status: 'active'
  },
  {
    id: 2,
    name: 'Liam Johnson',
    grade: 'Grade 3',
    age: 8,
    school: 'Westfield Elementary',
    avatar: '/child2-avatar.png',
    status: 'active'
  },
  {
    id: 3,
    name: 'Sophia Johnson',
    grade: 'Grade 7',
    age: 12,
    school: 'Springfield Middle School',
    avatar: '/child3-avatar.png',
    status: 'active'
  }
]);

const notificationSettings = ref([
  {
    key: 'childActivity',
    label: 'Child Activity Updates',
    description: 'Get notified when children complete assignments or reach milestones',
    email: true,
    push: true,
    sms: false
  },
  {
    key: 'screenTimeAlerts',
    label: 'Screen Time Alerts',
    description: 'Notifications when children reach their daily screen time limits',
    email: false,
    push: true,
    sms: true
  },
  {
    key: 'gradeReports',
    label: 'Grade Reports',
    description: 'Weekly and monthly progress reports',
    email: true,
    push: false,
    sms: false
  },
  {
    key: 'billingUpdates',
    label: 'Billing Updates',
    description: 'Payment receipts and billing notifications',
    email: true,
    push: false,
    sms: false
  },
  {
    key: 'securityAlerts',
    label: 'Security Alerts',
    description: 'Important security-related notifications',
    email: true,
    push: true,
    sms: true
  },
  {
    key: 'productUpdates',
    label: 'Product Updates',
    description: 'New features and platform updates',
    email: false,
    push: false,
    sms: false
  }
]);

const privacySettings = ref([
  {
    key: 'analytics',
    label: 'Usage Analytics',
    description: 'Help improve the platform by sharing anonymous usage data',
    enabled: true
  },
  {
    key: 'marketing',
    label: 'Marketing Communications',
    description: 'Receive information about new features and educational content',
    enabled: false
  },
  {
    key: 'thirdParty',
    label: 'Third-party Integrations',
    description: 'Allow approved educational tools to access basic profile information',
    enabled: true
  },
  {
    key: 'research',
    label: 'Educational Research',
    description: 'Contribute anonymized data to educational research studies',
    enabled: false
  }
]);
</script>
