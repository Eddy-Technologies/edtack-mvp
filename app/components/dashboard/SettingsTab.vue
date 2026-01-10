<template>
  <div class="space-y-6">
    <!-- Username & Password Section -->
    <div class="bg-white rounded-xl border border-gray-200">
      <div class="p-4 sm:p-6 border-b">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Account Settings</h2>
      </div>

      <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <!-- Email -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-4 border-b gap-2 sm:gap-0">
          <div class="min-w-0">
            <h3 class="text-base sm:text-lg font-medium text-gray-900">Email</h3>
            <p class="text-sm sm:text-base text-gray-600 truncate">{{ userInfo.email }}</p>
          </div>
          <Button
            v-if="user.auth_provider === 'email'"
            variant="secondary"
            text="Change"
            class="self-start sm:self-auto"
            @clicked="editEmail"
          />
          <p v-else class="text-sm text-gray-500">
            Managed by {{ getProviderDisplayName(user.auth_provider) }}
          </p>
        </div>

        <!-- Password -->
        <div v-if="user.auth_provider === 'email'" class="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-4 gap-2 sm:gap-0">
          <div>
            <h3 class="text-base sm:text-lg font-medium text-gray-900">Password</h3>
            <p class="text-sm sm:text-base text-gray-600">••••••••••••</p>
          </div>
          <Button
            variant="secondary"
            text="Change"
            class="self-start sm:self-auto"
            @clicked="editPassword"
          />
        </div>
      </div>
    </div>

    <!-- Tour Section -->
    <div class="bg-white rounded-xl border border-gray-200">
      <div class="p-4 sm:p-6 border-b">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Help & Onboarding</h2>
      </div>

      <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-4 gap-2 sm:gap-0">
          <div>
            <h3 class="text-base sm:text-lg font-medium text-gray-900">Take the Tour</h3>
            <p class="text-sm sm:text-base text-gray-600">Restart the onboarding tour to learn about features</p>
          </div>
          <Button
            variant="secondary"
            text="Restart Tour"
            icon="i-heroicons-academic-cap"
            class="self-start sm:self-auto"
            @clicked="restartTours"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->

    <ChangeEmailModal
      :is-open="showEmailModal"
      :current-email="userInfo.email"
      @close="showEmailModal = false"
    />

    <ChangePasswordModal
      :is-open="showPasswordModal"
      @close="showPasswordModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ChangeEmailModal from './common/ChangeEmailModal.vue';
import ChangePasswordModal from './common/ChangePasswordModal.vue';
import Button from '~/components/common/Button.vue';
import { useTour } from '~/composables/useTour';
import { useResponsive } from '~/composables/useResponsive';

const { resetTour, startTour } = useTour();
const { isMobile } = useResponsive();

// Modal states
const showEmailModal = ref(false);
const showPasswordModal = ref(false);

// Get user info from auth
const user = useMeStore();

// Data initialization
const userInfo = computed(() => {
  if (user) {
    return {
      email: user.email || 'Unknown'
    };
  }
  return {
    email: 'Loading...'
  };
});

// Methods
const editEmail = () => {
  showEmailModal.value = true;
};

const editPassword = () => {
  showPasswordModal.value = true;
};

// Restart onboarding tours
const restartTours = () => {
  resetTour('chat-tour');
  resetTour('dashboard-tour');

  // Start dashboard tour immediately since we're on the dashboard
  setTimeout(() => {
    startTour('dashboard-tour', isMobile.value);
  }, 500);
};

// Helper function to display provider names nicely
const getProviderDisplayName = (provider: string) => {
  switch (provider) {
    case 'google':
      return 'Google';
    case 'facebook':
      return 'Facebook';
    case 'github':
      return 'GitHub';
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
};
</script>
