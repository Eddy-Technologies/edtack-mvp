<template>
  <div class="space-y-6">
    <!-- Username & Password Section -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h2 class="text-2xl font-bold text-gray-900">Account Settings</h2>
      </div>

      <div class="p-6 space-y-6">
        <!-- Email -->
        <div class="flex items-center justify-between py-4 border-b">
          <div>
            <h3 class="text-lg font-medium text-gray-900">Email</h3>
            <p class="text-gray-600">{{ userInfo.email }}</p>
          </div>
          <Button
            variant="secondary"
            text="Change"
            @clicked="editEmail"
          />
        </div>

        <!-- Password -->
        <div class="flex items-center justify-between py-4">
          <div>
            <h3 class="text-lg font-medium text-gray-900">Password</h3>
            <p class="text-gray-600">••••••••••••</p>
          </div>
          <Button
            variant="secondary"
            text="Change"
            @clicked="editPassword"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->

    <ChangeEmailModal
      :is-open="showEmailModal"
      :current-email="userInfo.email"
      @close="showEmailModal = false"
      @email-updated="handleEmailUpdated"
    />

    <ChangePasswordModal
      :is-open="showPasswordModal"
      @close="showPasswordModal = false"
      @password-updated="handlePasswordUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ChangeEmailModal from './common/ChangeEmailModal.vue';
import ChangePasswordModal from './common/ChangePasswordModal.vue';
import Button from '~/components/common/Button.vue';

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

// Event handlers
const handleEmailUpdated = (newEmail: string) => {
  // The email will be updated when Supabase auth state changes
  // No need to manually update since userInfo is computed from user.value
};

const handlePasswordUpdated = () => {
  // Password updated successfully
};
</script>
