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

      <!-- Information Banner -->
      <div class="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex items-start space-x-3">
          <UIcon name="i-lucide-info" class="text-yellow-600 mt-0.5" size="20" />
          <div class="flex-1">
            <h3 class="text-sm font-medium text-yellow-800 mb-2">Credit Pledge</h3>
            <p class="text-sm text-justify text-yellow-700">
              This is a credit system which parents/teachers can pledge to distribute to their children/students.
              After students have accumulated credits and check out their purchase from the shop, orders will be sent to parents to complete the purchase.
              StudyWithEddy will not store money or credits nor request for you to transfer money to us.
              Please reach out to us if you have any questions at eddytech.ai@gmail.com
            </p>
          </div>
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
