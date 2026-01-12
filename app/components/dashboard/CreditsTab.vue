<template>
  <div class="dashboard-credits">
    <div class="credits-container">
      <!-- Header -->
      <div class="mb-4 sm:mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Credit Management</h1>
            <p class="text-sm sm:text-base text-gray-500">Manage your family's credit balance and transfers</p>
          </div>
          <Button
            :disabled="isLoading"
            variant="primary"
            is-loading="isLoading"
            icon="i-lucide-refresh-cw"
            class="self-start sm:self-auto"
            @click="handleRefresh"
          >
            {{ isLoading ? 'Refreshing...' : 'Refresh' }}
          </Button>
        </div>
      </div>

      <!-- Instructions -->
      <div class="mb-4 sm:mb-8">
        <CreditsInstructions :is-parent="isParent" />
      </div>

      <!-- Loading State -->
      <DashboardSkeleton v-if="isLoading" variant="cards" :count="3" />

      <!-- Credit Balance Section - Improved Layout -->
      <div v-else class="space-y-4 sm:space-y-6 mb-4 sm:mb-8">
        <!-- Credit Balance - Full Width, Most Prominent -->
        <CreditBalance />

        <!-- Action Cards Grid -->
        <div v-if="isParent" class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TopUpSection />
          <TransferSection />
        </div>
      </div>

      <!-- Transaction History -->
      <div v-if="!isLoading" class="mb-4 sm:mb-8">
        <ViewTransactions />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import Button from '../common/Button.vue';
import DashboardSkeleton from '../common/DashboardSkeleton.vue';
import CreditBalance from '~/components/credits/CreditBalance.vue';
import CreditsInstructions from '~/components/credits/CreditsInstructions.vue';
import TopUpSection from '~/components/credits/TopUpSection.vue';
import TransferSection from '~/components/credits/TransferSection.vue';
import ViewTransactions from '~/components/credits/ViewTransactions.vue';

// Single fetch point for all credit data
const { fetchCredits, refreshCredits, isLoading } = useCredit();

// Use me store for user role
const meStore = useMeStore();
const { isParent } = storeToRefs(meStore);

// Fetch credit data when Credits tab loads
onMounted(async () => {
  await fetchCredits();
});

// Handle refresh button click
const handleRefresh = async () => {
  await refreshCredits();
};
</script>
