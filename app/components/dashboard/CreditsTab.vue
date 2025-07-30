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
            icon="i-lucide-refresh-cw"
            @click="handleRefresh"
          >
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
