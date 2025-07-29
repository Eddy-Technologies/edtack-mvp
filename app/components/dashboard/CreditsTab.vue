<template>
  <div class="dashboard-credits">
    <div class="credits-container">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Credit Management</h1>
            <p class="text-gray-600">Manage your family's credit balance and transfers</p>
          </div>
          <Button
            :disabled="isLoading"
            variant="primary"
            is-loading="isLoading"
            @click="handleRefresh"
          >
            <svg
              :class="['w-4 h-4 mr-2', isLoading ? 'animate-spin' : '']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {{ isLoading ? 'Refreshing...' : 'Refresh' }}
          </Button>
        </div>
      </div>

      <!-- Credit Balance Section -->
      <div class="grid gap-6 mb-8">
        <CreditBalance />
        <TopUpSection />
        <TransferSection v-if="isParent" />
      </div>

      <!-- Family Management -->
      <div class="mb-8">
        <FamilyManagementSection v-if="isParent" />
        <ViewTransactions />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import Button from '../common/Button.vue';
import CreditBalance from '~/components/credits/CreditBalance.vue';
import TopUpSection from '~/components/credits/TopUpSection.vue';
import TransferSection from '~/components/credits/TransferSection.vue';
import FamilyManagementSection from '~/components/credits/FamilyManagementSection.vue';
import ViewTransactions from '~/components/credits/ViewTransactions.vue';

// Single fetch point for all credit data
const { fetchCredits, refreshCredits, isLoading, isParent } = useCredit();

// Fetch credit data when Credits tab loads
onMounted(async () => {
  await fetchCredits();
});

// Handle refresh button click
const handleRefresh = async () => {
  await refreshCredits();
};
</script>
