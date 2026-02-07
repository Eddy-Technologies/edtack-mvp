<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200"
      @click="$emit('close')"
    />

    <!-- Modal -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <!-- Close button -->
        <button
          class="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          @click="$emit('close')"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5 text-gray-400" />
        </button>

        <!-- Icon -->
        <div class="flex justify-center mb-4">
          <div
            :class="[
              'p-3 rounded-full',
              reason === 'rate_limit' ? 'bg-yellow-100' : 'bg-primary-100',
            ]"
          >
            <UIcon
              :name="iconName"
              :class="[
                'w-8 h-8',
                reason === 'rate_limit' ? 'text-yellow-600' : 'text-primary-600',
              ]"
            />
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-xl font-semibold text-gray-900 text-center mb-2">
          {{ title }}
        </h2>

        <!-- Description -->
        <p class="text-gray-600 text-center mb-6">
          {{ description }}
        </p>

        <!-- Benefits list -->
        <ul class="space-y-2 mb-6">
          <li
            v-for="benefit in benefits"
            :key="benefit"
            class="flex items-center gap-2 text-sm text-gray-700"
          >
            <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 flex-shrink-0" />
            {{ benefit }}
          </li>
        </ul>

        <!-- Actions -->
        <div class="flex flex-col gap-2">
          <UButton
            color="primary"
            size="lg"
            block
            @click="$emit('signup')"
          >
            Create free account
          </UButton>
          <UButton
            color="gray"
            variant="ghost"
            size="lg"
            block
            @click="$emit('login')"
          >
            Already have an account? Log in
          </UButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  reason: 'rate_limit' | 'near_limit' | 'feature' | null;
}>();

defineEmits<{
  close: [];
  signup: [];
  login: [];
}>();

const iconName = computed(() => {
  switch (props.reason) {
    case 'rate_limit':
      return 'i-lucide-clock';
    case 'near_limit':
      return 'i-lucide-alert-circle';
    case 'feature':
      return 'i-lucide-lock';
    default:
      return 'i-lucide-user-plus';
  }
});

const title = computed(() => {
  switch (props.reason) {
    case 'rate_limit':
      return 'Daily limit reached';
    case 'near_limit':
      return 'Running low on messages';
    case 'feature':
      return 'Unlock this feature';
    default:
      return 'Create an account';
  }
});

const description = computed(() => {
  switch (props.reason) {
    case 'rate_limit':
      return 'You\'ve used all your free messages for today. Sign up to continue learning without limits.';
    case 'near_limit':
      return 'You have only a few messages left today. Create an account to get more access.';
    case 'feature':
      return 'This feature requires an account. Sign up to unlock all features.';
    default:
      return 'Join to save your progress and get more access.';
  }
});

const benefits = [
  'More messages per day',
  'Save your chat history',
  'Track your learning progress',
  'Access credit transfers and subscriptions',
];
</script>
