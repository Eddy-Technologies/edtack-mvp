<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" @click="closeModal">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors"
          @click="closeModal"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Free Plan -->
          <div class="border-2 border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors">
            <div class="text-center">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
              <div class="text-4xl font-bold text-gray-900 mb-4">$0<span class="text-lg text-gray-500">/month</span></div>
              <p class="text-gray-600 mb-6">Perfect for getting started with basic features</p>
            </div>

            <div class="space-y-4 mb-6">
              <div class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">50 AI queries per month</span>
              </div>
              <div class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Basic study tools</span>
              </div>
              <div class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Limited practice questions</span>
              </div>
              <div class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Community support</span>
              </div>
            </div>

            <button
              class="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              @click="selectPlan('free')"
            >
              Get Started Free
            </button>
          </div>

          <!-- Premium Plan -->
          <div class="border-2 border-primary rounded-lg p-6 relative bg-primary-50">
            <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span class="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>

            <div class="text-center">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h3>
              <div class="text-4xl font-bold text-primary mb-4">$25<span class="text-lg text-gray-500">/month</span></div>
              <p class="text-gray-600 mb-6">Everything you need for comprehensive learning</p>
            </div>

            <div class="space-y-4 mb-6">
              <div class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Unlimited AI queries</span>
              </div>
              <div class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Advanced study tools</span>
              </div>
              <div class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Unlimited practice questions</span>
              </div>
              <div class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Priority support</span>
              </div>
              <div class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Detailed progress tracking</span>
              </div>
              <div class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-700">Offline access</span>
              </div>
            </div>

            <button
              class="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
              @click="selectPlan('premium')"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
  studentName?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'plan-selected', plan: 'free' | 'premium', studentName?: string): void;
}>();

const closeModal = () => {
  emit('close');
};

const selectPlan = (plan: 'free' | 'premium') => {
  emit('plan-selected', plan, props.studentName);
  closeModal();
};
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
