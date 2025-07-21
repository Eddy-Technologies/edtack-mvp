<template>
  <Layout
    :user-name="user.userDisplayFullName"
    :user-email="user.email"
  >
    <OverviewTab v-if="currentTab === 'overview'" />
    <SubscriptionTab v-else-if="currentTab === 'subscription'" />
    <SettingsTab v-else-if="currentTab === 'settings'" />
    <ShopTab v-else-if="currentTab === 'shop'" />
    <div v-else class="text-center py-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h2>
      <p class="text-gray-600">Select a section from the sidebar to get started.</p>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Layout from '~/components/dashboard/Layout.vue';
import { useMeStore } from '~/stores/me';

// Unified Components
import OverviewTab from '~/components/dashboard/OverviewTab.vue';
import SubscriptionTab from '~/components/dashboard/SubscriptionTab.vue';
import ShopTab from '~/components/dashboard/ShopTab.vue';
import SettingsTab from '~/components/dashboard/SettingsTab.vue';

definePageMeta({
  middleware: ['auth'],
});

// Get authentication state
const user = useMeStore();

// Get current tab from route query or default to 'overview'
const route = useRoute();
const currentTab = computed(() => {
  return (route.query.tab as string) || 'overview';
});

// Update page title based on current tab
const pageTitle = computed(() => {
  const tabTitles = {
    overview: 'Overview',
    subscription: 'Subscription',
    settings: 'Settings',
    shop: 'Shop',
  };
  return tabTitles[currentTab.value as keyof typeof tabTitles] || 'Dashboard';
});

// Set page title
useHead({
  title: () => `${pageTitle.value} - Dashboard`,
});
</script>
