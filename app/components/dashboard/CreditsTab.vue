<template>
  <div class="dashboard-credits">
    <div class="credits-container">
      <!-- Header -->
      <div class="mb-4 sm:mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 class="text-xl sm:text-3xl font-bold text-gray-900 mb-1">Credit Management</h1>
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

      <!-- Information Banner -->
      <div class="mb-4 sm:mb-8 bg-blue-50/80 backdrop-blur-sm border border-blue-200/60 rounded-xl p-3 sm:p-5 transition-all hover:shadow-sm">
        <div class="flex items-start gap-3 sm:gap-4">
          <div class="flex-shrink-0 w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <UIcon name="i-lucide-lightbulb" class="text-blue-600" size="20" />
          </div>
          <div class="flex-1">
            <h3 class="text-xs sm:text-sm font-semibold text-blue-800 mb-1 sm:mb-1.5">How Credits Work ($1 = 100 credits)</h3>
            <p class="text-xs sm:text-sm text-blue-700 leading-relaxed">
              This is a internal credit system which parents/teachers can pledge to distribute to their children/students. Think of credits as a point system.
              After students have accumulated credits, they can use the credits to check out their items from the shop, orders will be then be sent to parents to pay through stripe payment.
              StudyWithEddy will not store money or credits nor request for you to transfer money to us.
              Please reach out to us if you have any questions at <a href="mailto:eddytech.ai@gmail.com" class="font-medium underline hover:no-underline">eddytech.ai@gmail.com</a>
            </p>
          </div>
        </div>
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
