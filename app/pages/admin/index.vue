<template>
  <Layout>
    <OverviewTab v-if="currentTab === 'overview'" />
    <OrdersTab v-else-if="currentTab === 'orders'" />
    <TokensTab v-else-if="currentTab === 'tokens'" />
    <ProductsTab v-else-if="currentTab === 'products'" />
    <CharactersTab v-else-if="currentTab === 'characters'" />
    <SubjectsTab v-else-if="currentTab === 'subjects'" />
    <QAReviewTab v-else-if="currentTab === 'qa-review'" />
    <div v-else class="text-center py-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome to Admin Dashboard</h2>
      <p class="text-gray-600">Select a section from the sidebar to get started.</p>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Layout from '~/components/admin/Layout.vue';

// Admin Tab Components
import OverviewTab from '~/components/admin/OverviewTab.vue';
import OrdersTab from '~/components/admin/OrdersTab.vue';
import TokensTab from '~/components/admin/TokensTab.vue';
import ProductsTab from '~/components/admin/ProductsTab.vue';
import CharactersTab from '~/components/admin/CharactersTab.vue';
import SubjectsTab from '~/components/admin/SubjectsTab.vue';
import QAReviewTab from '~/components/admin/QAReviewTab.vue';

useHead({
  title: 'Admin Dashboard'
});

definePageMeta({
  middleware: ['admin']
});

// Get current tab from route query or default to 'overview'
const route = useRoute();
const currentTab = computed(() => {
  return (route.query.tab as string) || 'overview';
});

// Update page title based on current tab
const pageTitle = computed(() => {
  const tabTitles: Record<string, string> = {
    'overview': 'Overview',
    'orders': 'Orders',
    'tokens': 'Token Usage',
    'products': 'Products',
    'characters': 'Characters',
    'subjects': 'Subjects',
    'qa-review': 'QA Review',
  };
  return tabTitles[currentTab.value] || 'Admin Dashboard';
});

// Set page title
useHead({
  title: () => `${pageTitle.value} - Admin Dashboard`,
});
</script>
