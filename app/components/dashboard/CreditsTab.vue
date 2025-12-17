<template>
  <div class="dashboard-credits">
    <ClientOnly>
      <div class="credits-container">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Credit Management</h1>
              <p class="text-gray-500">Manage your family's credit balance and transfers</p>
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
        <div class="mb-8 bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-xl p-5 transition-all hover:shadow-sm">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <UIcon name="i-lucide-lightbulb" class="text-amber-600" size="20" />
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-amber-800 mb-1.5">How Credits Work ($1 = 100 credits)</h3>
              <p class="text-sm text-amber-700 leading-relaxed">
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
        <div v-else class="space-y-6 mb-8">
          <!-- Credit Balance - Full Width, Most Prominent -->
          <CreditBalance />

          <!-- Action Cards Grid -->
          <div v-if="isParent" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopUpSection />
            <TransferSection />
          </div>
        </div>

        <!-- Transaction History -->
        <div v-if="!isLoading" class="mb-8">
          <ViewTransactions />
        </div>
      </div>
      <template #fallback>
        <div class="credits-container">
          <!-- Header Skeleton -->
          <div class="mb-8">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
              <div class="space-y-2">
                <div class="h-8 bg-gray-200 rounded w-64" />
                <div class="h-5 bg-gray-200 rounded w-80" />
              </div>
              <div class="h-10 bg-gray-200 rounded w-28" />
            </div>
          </div>
          <!-- Content Skeleton -->
          <div class="space-y-6">
            <div class="h-32 bg-gray-200 rounded-xl animate-pulse" />
            <div class="h-48 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </template>
    </ClientOnly>
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
