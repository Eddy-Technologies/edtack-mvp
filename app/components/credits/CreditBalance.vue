<template>
  <div class="relative bg-gradient-to-br from-primary via-primary-400 to-secondary rounded-2xl p-8 text-white shadow-lg overflow-hidden">
    <ClientOnly>
      <!-- Decorative Background Elements -->
      <div class="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full" />
      <div class="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full" />

      <!-- Loading State with Skeleton -->
      <div v-if="isLoading" class="relative z-10 py-2">
        <div class="flex items-center justify-between mb-6">
          <div class="space-y-3">
            <div class="h-7 w-44 bg-white/20 rounded-lg animate-pulse" />
            <div class="h-4 w-32 bg-white/10 rounded animate-pulse" />
          </div>
          <div class="w-16 h-16 bg-white/20 rounded-2xl animate-pulse" />
        </div>
        <div class="space-y-2">
          <div class="h-14 w-52 bg-white/20 rounded-lg animate-pulse" />
          <div class="h-6 w-24 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="relative z-10 text-center py-8">
        <div class="w-16 h-16 mx-auto bg-red-500/20 rounded-2xl flex items-center justify-center mb-4">
          <UIcon name="i-lucide-alert-circle" class="text-red-200" size="32" />
        </div>
        <p class="text-red-200 mb-4">{{ error }}</p>
        <button class="bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl hover:bg-white/30 transition-all duration-200" @click="loadBalance">
          Try Again
        </button>
      </div>

      <!-- Main Content -->
      <div v-else class="relative z-10">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold mb-1">Available Credits</h2>
            <p class="text-white/70 text-sm">Your current balance</p>
          </div>
          <div class="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl ring-1 ring-white/30">
            <UIcon
              name="i-lucide-wallet"
              class="text-white"
              size="32"
            />
          </div>
        </div>

        <!-- Balance Display -->
        <div>
          <div class="flex items-baseline gap-3">
            <span class="text-5xl font-bold tabular-nums" :class="{ 'animate-number-pop': balanceChanged }">
              {{ displayBalance.toLocaleString() }}
            </span>
            <span class="text-2xl font-medium text-white/70">
              credits
            </span>
          </div>
        </div>
      </div>
      <template #fallback>
        <div class="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full" />
        <div class="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full" />
        <div class="relative z-10 py-2">
          <div class="flex items-center justify-between mb-6">
            <div class="space-y-3">
              <div class="h-7 w-44 bg-white/20 rounded-lg animate-pulse" />
              <div class="h-4 w-32 bg-white/10 rounded animate-pulse" />
            </div>
            <div class="w-16 h-16 bg-white/20 rounded-2xl animate-pulse" />
          </div>
          <div class="space-y-2">
            <div class="h-14 w-52 bg-white/20 rounded-lg animate-pulse" />
            <div class="h-6 w-24 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

// Use unified credit management - consume shared state only
const {
  balance,
  isLoading,
  error,
  refreshCredits
} = useCredit();

// Alias for template consistency
const loadBalance = refreshCredits;

// Animated balance display
const displayBalance = ref(0);
const balanceChanged = ref(false);
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

// Animate balance number counting (only on client)
const animateBalance = (target: number) => {
  // Skip animation during SSR - just set the value directly
  if (!isMounted.value || typeof window === 'undefined') {
    displayBalance.value = target;
    return;
  }

  const duration = 600;
  const start = displayBalance.value;
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    displayBalance.value = Math.round(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
};

// Watch for balance changes
watch(balance, (newVal, oldVal) => {
  if (newVal !== oldVal && oldVal !== undefined) {
    balanceChanged.value = true;
    setTimeout(() => balanceChanged.value = false, 300);
  }
  animateBalance(newVal);
}, { immediate: true });
</script>

<style scoped>
@keyframes numberPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

.animate-number-pop {
  animation: numberPop 0.3s ease-out;
}
</style>
