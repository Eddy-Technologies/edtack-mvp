<template>
  <div class="space-y-6">
    <!-- Family Plan Overview -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h2 class="text-2xl font-bold text-gray-900">Family Subscription</h2>
      </div>
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <svg
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-900">{{ familyPlan.name }}</h3>
              <p class="text-gray-600">{{ familyPlan.description }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ familyPlan.childrenCount }} children • Next billing: {{ familyPlan.nextBilling }}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-gray-900">${{ familyPlan.price }}</div>
            <div class="text-sm text-gray-500">per month</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Children Usage -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Children Usage Overview</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div v-for="child in childrenUsage" :key="child.id" class="border rounded-lg p-4">
            <div class="flex items-center space-x-3 mb-4">
              <img :src="child.avatar" :alt="child.name" class="w-10 h-10 rounded-full">
              <div>
                <h4 class="font-semibold text-gray-900">{{ child.name }}</h4>
                <p class="text-sm text-gray-600">{{ child.plan }}</p>
              </div>
            </div>

            <!-- Credits Usage -->
            <div class="space-y-3">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">Credits Used</span>
                  <span>{{ child.usage.credits.used }} / {{ child.usage.credits.total }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full" :style="{ width: (child.usage.credits.used / child.usage.credits.total) * 100 + '%' }" />
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">AI Assistance</span>
                  <span>{{ child.usage.ai.used }} / {{ child.usage.ai.total }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-green-600 h-2 rounded-full" :style="{ width: (child.usage.ai.used / child.usage.ai.total) * 100 + '%' }" />
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">Screen Time</span>
                  <span>{{ child.usage.screenTime.used }}h / {{ child.usage.screenTime.limit }}h</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-purple-600 h-2 rounded-full" :style="{ width: (child.usage.screenTime.used / child.usage.screenTime.limit) * 100 + '%' }" />
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t">
              <div class="flex justify-between text-xs text-gray-600">
                <span>Monthly Spending</span>
                <span>${{ child.spending.thisMonth }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Method -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Payment Method</h3>
      </div>
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
              <span class="text-white text-xs font-bold">VISA</span>
            </div>
            <div>
              <p class="font-medium text-gray-900">•••• •••• •••• {{ paymentMethod.lastFour }}</p>
              <p class="text-sm text-gray-600">Expires {{ paymentMethod.expiry }}</p>
            </div>
          </div>
          <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Update
          </button>
        </div>
      </div>
    </div>

    <!-- Family Plan Features -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Family Plan Features</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900">Included Features</h4>
            <div class="space-y-3">
              <div v-for="feature in familyPlan.features" :key="feature.name" class="flex items-start space-x-3">
                <svg
                  class="w-5 h-5 text-green-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <p class="text-gray-900">{{ feature.name }}</p>
                  <p v-if="feature.description" class="text-sm text-gray-600">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="font-medium text-gray-900">Parental Controls</h4>
            <div class="space-y-3">
              <div v-for="control in parentalControls" :key="control.name" class="flex items-start space-x-3">
                <svg
                  class="w-5 h-5 text-blue-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <div>
                  <p class="text-gray-900">{{ control.name }}</p>
                  <p v-if="control.description" class="text-sm text-gray-600">{{ control.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Billing History -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Billing History</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="bill in billingHistory" :key="bill.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ bill.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ bill.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ bill.amount }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                    bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{ bill.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button class="text-blue-600 hover:text-blue-700">Download</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Upgrade Options -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Upgrade Options</h3>
        <p class="text-gray-600">Add more children or upgrade features</p>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="border rounded-lg p-4">
            <h4 class="font-semibold text-gray-900 mb-2">Add More Children</h4>
            <p class="text-gray-600 text-sm mb-4">Add additional children to your family plan</p>
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold text-gray-900">$5.99</span>
              <span class="text-gray-500">per child/month</span>
            </div>
            <button class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add Child
            </button>
          </div>

          <div class="border rounded-lg p-4">
            <h4 class="font-semibold text-gray-900 mb-2">Premium Features</h4>
            <p class="text-gray-600 text-sm mb-4">Unlock advanced analytics and unlimited AI assistance</p>
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold text-gray-900">$15.99</span>
              <span class="text-gray-500">additional/month</span>
            </div>
            <button class="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const familyPlan = ref({
  name: 'Family Pro Plan',
  description: 'Perfect for families with multiple children',
  price: 49.99,
  childrenCount: 3,
  nextBilling: 'March 15, 2024',
  features: [
    { name: 'Up to 5 children', description: 'Add up to 5 children to your account' },
    { name: 'Unlimited notes per child', description: 'No limits on note creation' },
    { name: 'AI Study Assistant', description: '1000 queries per child per month' },
    { name: 'Advanced parental controls', description: 'Screen time, content filters, and more' },
    { name: 'Family progress reports', description: 'Monthly insights and analytics' },
    { name: 'Priority support', description: 'Email and chat support' },
    { name: 'Offline access', description: 'Download content for offline study' }
  ]
});

const childrenUsage = ref([
  {
    id: 1,
    name: 'Emma Johnson',
    avatar: '/child1-avatar.png',
    plan: 'Student Pro',
    usage: {
      credits: { used: 847, total: 1000 },
      ai: { used: 342, total: 500 },
      screenTime: { used: 3.2, limit: 4 }
    },
    spending: { thisMonth: 12.50 }
  },
  {
    id: 2,
    name: 'Liam Johnson',
    avatar: '/child2-avatar.png',
    plan: 'Student Basic',
    usage: {
      credits: { used: 234, total: 500 },
      ai: { used: 89, total: 200 },
      screenTime: { used: 1.8, limit: 2.5 }
    },
    spending: { thisMonth: 5.99 }
  },
  {
    id: 3,
    name: 'Sophia Johnson',
    avatar: '/child3-avatar.png',
    plan: 'Student Pro',
    usage: {
      credits: { used: 692, total: 1000 },
      ai: { used: 445, total: 500 },
      screenTime: { used: 4.1, limit: 5 }
    },
    spending: { thisMonth: 18.75 }
  }
]);

const paymentMethod = ref({
  lastFour: '4242',
  expiry: '12/26'
});

const parentalControls = ref([
  { name: 'Screen Time Limits', description: 'Set daily and weekly usage limits' },
  { name: 'Content Filtering', description: 'Age-appropriate content restrictions' },
  { name: 'Spending Controls', description: 'Monitor and limit purchases' },
  { name: 'Time Restrictions', description: 'Control when apps can be used' },
  { name: 'Activity Reports', description: 'Detailed usage and progress reports' },
  { name: 'Remote Management', description: 'Manage settings from anywhere' }
]);

const billingHistory = ref([
  {
    id: 1,
    date: 'Feb 15, 2024',
    description: 'Family Pro Plan - Monthly',
    amount: 49.99,
    status: 'paid'
  },
  {
    id: 2,
    date: 'Jan 15, 2024',
    description: 'Family Pro Plan - Monthly',
    amount: 49.99,
    status: 'paid'
  },
  {
    id: 3,
    date: 'Dec 15, 2023',
    description: 'Family Pro Plan - Monthly + Additional Child',
    amount: 55.98,
    status: 'paid'
  },
  {
    id: 4,
    date: 'Nov 15, 2023',
    description: 'Family Basic Plan - Monthly',
    amount: 29.99,
    status: 'paid'
  },
  {
    id: 5,
    date: 'Oct 15, 2023',
    description: 'Family Basic Plan - Monthly',
    amount: 29.99,
    status: 'paid'
  }
]);
</script>
