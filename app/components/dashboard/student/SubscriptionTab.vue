<template>
  <div class="space-y-6">
    <!-- Current Plan -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h2 class="text-2xl font-bold text-gray-900">Current Subscription</h2>
      </div>
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
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
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-900">{{ currentPlan.name }}</h3>
              <p class="text-gray-600">{{ currentPlan.description }}</p>
              <p class="text-sm text-gray-500 mt-1">Next billing: {{ currentPlan.nextBilling }}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-gray-900">${{ currentPlan.price }}</div>
            <div class="text-sm text-gray-500">per month</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Usage Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-semibold text-gray-900">Credits Used</h4>
          <svg
            class="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>{{ usage.creditsUsed }} / {{ usage.creditsTotal }}</span>
            <span>{{ Math.round((usage.creditsUsed / usage.creditsTotal) * 100) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full" :style="{ width: (usage.creditsUsed / usage.creditsTotal) * 100 + '%' }" />
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-semibold text-gray-900">AI Assistance</h4>
          <svg
            class="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>{{ usage.aiUsed }} / {{ usage.aiTotal }}</span>
            <span>{{ Math.round((usage.aiUsed / usage.aiTotal) * 100) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-green-600 h-2 rounded-full" :style="{ width: (usage.aiUsed / usage.aiTotal) * 100 + '%' }" />
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border">
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-semibold text-gray-900">Storage</h4>
          <svg
            class="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>{{ usage.storageUsed }}GB / {{ usage.storageTotal }}GB</span>
            <span>{{ Math.round((usage.storageUsed / usage.storageTotal) * 100) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-purple-600 h-2 rounded-full" :style="{ width: (usage.storageUsed / usage.storageTotal) * 100 + '%' }" />
          </div>
        </div>
      </div>
    </div>

    <!-- Features Included -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Features Included</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="feature in currentPlan.features" :key="feature.name" class="flex items-center space-x-3">
            <svg
              class="w-5 h-5 text-green-600"
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
            <span class="text-gray-900">{{ feature.name }}</span>
            <span v-if="feature.limit" class="text-sm text-gray-500">({{ feature.limit }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Available Plans -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Available Plans</h3>
        <p class="text-gray-600">Upgrade or change your subscription plan</p>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="plan in availablePlans"
            :key="plan.id"
            :class="[
              'border rounded-xl p-6 relative',
              plan.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            ]"
          >
            <div v-if="plan.popular" class="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>

            <div class="text-center">
              <h4 class="text-xl font-semibold text-gray-900">{{ plan.name }}</h4>
              <p class="text-gray-600 mt-2">{{ plan.description }}</p>
              <div class="mt-4">
                <span class="text-4xl font-bold text-gray-900">${{ plan.price }}</span>
                <span class="text-gray-500">/month</span>
              </div>
            </div>

            <ul class="mt-6 space-y-3">
              <li v-for="feature in plan.features" :key="feature.name" class="flex items-center text-sm">
                <svg
                  class="w-4 h-4 text-green-600 mr-3"
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
                {{ feature.name }}
                <span v-if="feature.limit" class="ml-auto text-gray-500">({{ feature.limit }})</span>
              </li>
            </ul>

            <button
              :class="[
                'w-full mt-6 px-4 py-2 rounded-lg font-medium transition-colors',
                plan.current ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
              ]"
              :disabled="plan.current"
            >
              {{ plan.current ? 'Current Plan' : 'Upgrade to ' + plan.name }}
            </button>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const currentPlan = ref({
  name: 'Student Pro',
  description: 'Perfect for serious students',
  price: 19.99,
  nextBilling: 'March 15, 2024',
  features: [
    { name: 'Unlimited Notes', limit: null },
    { name: 'AI Study Assistant', limit: '500 queries/month' },
    { name: 'Advanced Analytics', limit: null },
    { name: 'Priority Support', limit: null },
    { name: 'Offline Access', limit: null },
    { name: 'Study Groups', limit: 'Up to 10 members' }
  ]
});
const usage = ref({
  creditsUsed: 847,
  creditsTotal: 1000,
  aiUsed: 342,
  aiTotal: 500,
  storageUsed: 2.3,
  storageTotal: 10
});

const availablePlans = ref([
  {
    id: 1,
    name: 'Basic',
    description: 'Essential features for beginners',
    price: 9.99,
    popular: false,
    current: false,
    features: [
      { name: 'Basic Notes', limit: '50 notes' },
      { name: 'AI Assistant', limit: '100 queries/month' },
      { name: 'Basic Analytics', limit: null },
      { name: 'Email Support', limit: null }
    ]
  },
  {
    id: 2,
    name: 'Student Pro',
    description: 'Perfect for serious students',
    price: 19.99,
    popular: true,
    current: true,
    features: [
      { name: 'Unlimited Notes', limit: null },
      { name: 'AI Study Assistant', limit: '500 queries/month' },
      { name: 'Advanced Analytics', limit: null },
      { name: 'Priority Support', limit: null },
      { name: 'Offline Access', limit: null },
      { name: 'Study Groups', limit: 'Up to 10 members' }
    ]
  },
  {
    id: 3,
    name: 'Premium',
    description: 'Advanced features for power users',
    price: 39.99,
    popular: false,
    current: false,
    features: [
      { name: 'Everything in Pro', limit: null },
      { name: 'Unlimited AI Queries', limit: null },
      { name: 'Custom Integrations', limit: null },
      { name: '24/7 Phone Support', limit: null },
      { name: 'Advanced Reporting', limit: null },
      { name: 'API Access', limit: null }
    ]
  }
]);

const billingHistory = ref([
  {
    id: 1,
    date: 'Feb 15, 2024',
    description: 'Student Pro - Monthly',
    amount: 19.99,
    status: 'paid'
  },
  {
    id: 2,
    date: 'Jan 15, 2024',
    description: 'Student Pro - Monthly',
    amount: 19.99,
    status: 'paid'
  },
  {
    id: 3,
    date: 'Dec 15, 2023',
    description: 'Student Pro - Monthly',
    amount: 19.99,
    status: 'paid'
  },
  {
    id: 4,
    date: 'Nov 15, 2023',
    description: 'Basic - Monthly',
    amount: 9.99,
    status: 'paid'
  }
]);
</script>
