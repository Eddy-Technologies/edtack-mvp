<template>
  <div class="space-y-8">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 text-center mb-2">Choose Your Plan</h2>
      <p class="text-gray-600">
        Select the perfect plan for your child's educational journey
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pb-12">
      <!-- Free Plan -->
      <div
        class="border-2 border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors cursor-pointer"
        @click="selectPlan('free')"
      >
        <div class="text-center">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
          <div class="text-4xl font-bold text-gray-900 mb-4">
            SGD 0<span class="text-lg text-gray-500"> monthly</span>
          </div>
          <p class="text-gray-600 mb-6">
            Perfect for getting started with basic features
          </p>
        </div>

        <div class="space-y-4 mb-6">
          <div class="flex items-center space-x-3">
            <Icon name="i-heroicons-check" class="w-5 h-5 text-primary" />
            <span class="text-gray-700">Limited queries per month</span>
          </div>
          <div class="flex items-center space-x-3">
            <Icon name="i-heroicons-check" class="w-5 h-5 text-primary" />
            <span class="text-gray-700">Basic study tools</span>
          </div>
          <div class="flex items-center space-x-3">
            <Icon name="i-heroicons-check" class="w-5 h-5 text-primary" />
            <span class="text-gray-700">Limited practice questions</span>
          </div>
          <div class="flex items-center space-x-3">
            <Icon name="i-heroicons-check" class="w-5 h-5 text-primary" />
            <span class="text-gray-700">Limited chat features</span>
          </div>
        </div>

        <Button
          text="Get Started Free"
          class="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium transition-colors"
          @click="handleFreeTrialClick"
        />
      </div>

      <!-- Premium Plan -->
      <div
        class="border-2 border-primary-500 rounded-lg p-6 hover:border-primary-600 transition-colors relative bg-primary-50/30 cursor-pointer"
        @click="selectPlan('premium')"
      >
        <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span
            class="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium"
          >Most Popular</span>
        </div>

        <div class="text-center">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h3>
          <div class="text-4xl font-bold text-primary-600 mb-4">
            SGD 29<span class="text-lg text-gray-500"> monthly</span>
          </div>
          <p class="text-gray-600 mb-6">Unlock unlimited learning potential</p>
        </div>

        <div class="space-y-4 mb-6">
          <div class="flex items-center space-x-3">
            <Icon name="i-heroicons-check" class="w-5 h-5 text-primary" />
            <span class="text-gray-700">Unlimited AI queries</span>
          </div>
          <div class="flex items-center space-x-3">
            <Icon name="i-heroicons-check" class="w-5 h-5 text-primary" />
            <span class="text-gray-700">Advanced study tools</span>
          </div>
          <div class="flex items-center space-x-3">
            <Icon name="i-heroicons-check" class="w-5 h-5 text-primary" />
            <span class="text-gray-700">Unlimited practice questions</span>
          </div>
          <div class="flex items-center space-x-3">
            <Icon name="i-heroicons-check" class="w-5 h-5 text-primary" />
            <span class="text-gray-700">Priority support</span>
          </div>
          <div class="flex items-center space-x-3">
            <Icon name="i-heroicons-check" class="w-5 h-5 text-primary" />
            <span class="text-gray-700">Detailed progress tracking</span>
          </div>
          <div class="flex items-center space-x-3">
            <Icon name="i-heroicons-check" class="w-5 h-5 text-primary" />
            <span class="text-gray-700">Unlimited chat features</span>
          </div>
        </div>

        <Button
          disabled
          class="w-full py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          @click="handlePremiumTrialClick"
        >
          Start Premium Trial
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Button from '~/components/common/Button.vue';

const props = defineProps({
  isModal: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const router = useRouter();

const selectPlan = (plan) => {
  // Handle plan selection logic
  console.log('Selected plan:', plan);
};

const handleFreeTrialClick = () => {
  // If in modal, just close modal without navigation
  if (props.isModal) {
    emit('close');
    return;
  }
  // Navigate to chat for free trial (only when not in modal)
  router.push('/chat');
};

const handlePremiumTrialClick = () => {
  // If in modal, just close modal without navigation
  if (props.isModal) {
    emit('close');
    return;
  }
  // Navigate to subscription checkout (only when not in modal)
  router.push('/subscription/checkout');
};
</script>
