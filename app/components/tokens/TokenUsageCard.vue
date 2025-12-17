<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <ClientOnly>
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Token Usage</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ tierDisplayName }}</p>
        </div>
        <Button
          v-if="isLimitExceeded || isApproachingLimit"
          class="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
          @click="openUpgradePortal"
        >
          Upgrade Plan
        </Button>
      </div>

      <div v-if="!isLoading && tokenUsageData">
        <!-- Individual Usage -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Usage
            </span>
            <span class="text-sm font-semibold" :class="usageColorClass">
              {{ formattedUsage }}
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              class="h-2.5 rounded-full transition-all duration-300"
              :class="progressBarClass"
              :style="{ width: `${Math.min(usagePercentage, 100)}%` }"
            />
          </div>

          <p v-if="isUnlimited" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Unlimited tokens available
          </p>
          <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {{ Math.round(usagePercentage) }}% used this billing cycle
          </p>
        </div>

        <!-- Warning Message -->
        <div
          v-if="warningMessage"
          class="mb-4 p-3 rounded-md"
          :class="warningBgClass"
        >
          <p class="text-sm" :class="warningTextClass">
            {{ warningMessage }}
          </p>
        </div>

        <!-- Billing Cycle -->
        <div v-if="tokenUsageData.billingCycle.start" class="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Billing cycle: {{ formatDate(tokenUsageData.billingCycle.start) }} - {{ formatDate(tokenUsageData.billingCycle.end) }}
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-4">
        <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        <Button
          class="mt-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
          @click="refreshTokenUsage"
        >
          Try Again
        </Button>
      </div>

      <template #fallback>
        <div class="flex justify-between items-start mb-4">
          <div class="space-y-2 animate-pulse">
            <div class="h-5 bg-gray-200 rounded w-32" />
            <div class="h-4 bg-gray-200 rounded w-24" />
          </div>
        </div>
        <div class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTokenUsage } from '~/composables/useTokenUsage';
import Button from '~/components/common/Button.vue';

const {
  tokenUsageData,
  isLoading,
  error,
  usagePercentage,
  formattedUsage,
  isUnlimited,
  isApproachingLimit,
  isLimitExceeded,
  warningMessage,
  tierDisplayName,
  fetchTokenUsage,
  refreshTokenUsage,
  openUpgradePortal
} = useTokenUsage();

// Load data on mount
onMounted(() => {
  fetchTokenUsage();
});

// Computed color classes
const usageColorClass = computed(() => {
  if (isLimitExceeded.value) return 'text-red-600 dark:text-red-400';
  if (isApproachingLimit.value) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-gray-900 dark:text-white';
});

const progressBarClass = computed(() => {
  if (isLimitExceeded.value) return 'bg-red-600';
  if (isApproachingLimit.value) return 'bg-yellow-500';
  return 'bg-green-500';
});

const warningBgClass = computed(() => {
  if (isLimitExceeded.value) return 'bg-red-50 dark:bg-red-900/20';
  return 'bg-yellow-50 dark:bg-yellow-900/20';
});

const warningTextClass = computed(() => {
  if (isLimitExceeded.value) return 'text-red-700 dark:text-red-300';
  return 'text-yellow-700 dark:text-yellow-300';
});

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
</script>
