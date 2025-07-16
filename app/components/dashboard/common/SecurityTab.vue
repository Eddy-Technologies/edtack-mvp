<template>
  <div class="space-y-6">
    <!-- Username & Password Section -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h2 class="text-2xl font-bold text-gray-900">Login & Security</h2>
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

    <!-- Two-Factor Authentication -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
      </div>

      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h4 class="text-lg font-medium text-gray-900">Authenticator App</h4>
                <p class="text-sm text-gray-600">
                  {{ twoFactorEnabled ? 'Enabled - Your account is protected' : 'Add an extra layer of security to your account' }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <div class="flex items-center">
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="twoFactorEnabled"
                  type="checkbox"
                  class="sr-only peer"
                  @change="toggle2FA"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
            <Button
              v-if="twoFactorEnabled"
              variant="secondary-gray"
              text="Manage"
              @clicked="manage2FA"
            />
          </div>
        </div>

        <!-- Recovery Codes -->
        <div v-if="twoFactorEnabled" class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div class="flex items-start space-x-3">
            <svg
              class="w-5 h-5 text-amber-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h5 class="font-medium text-amber-800">Recovery Codes</h5>
              <p class="text-sm text-amber-700 mt-1">
                Make sure you have saved your recovery codes. You'll need them if you lose access to your authenticator app.
              </p>
              <Button
                variant="secondary"
                text="View Recovery Codes"
                extra-classes="mt-2 text-sm"
                @clicked="viewRecoveryCodes"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Management -->
    <div class="bg-white rounded-xl shadow-sm border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Active Sessions</h3>
      </div>

      <div class="p-6">
        <div class="space-y-4">
          <div v-for="session in activeSessions" :key="session.id" class="flex items-center justify-between py-3 border-b last:border-b-0">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">{{ session.device }}</h4>
                <p class="text-sm text-gray-600">{{ session.location }} • {{ session.lastActive }}</p>
                <p v-if="session.current" class="text-xs text-green-600">Current session</p>
              </div>
            </div>
            <Button
              v-if="!session.current"
              variant="secondary-danger"
              text="Revoke"
              size="sm"
              @clicked="revokeSession(session.id)"
            />
          </div>
        </div>

        <div class="mt-6 pt-4 border-t">
          <Button
            variant="secondary-danger"
            text="Sign out of all other sessions"
            @clicked="revokeAllSessions"
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

    <TwoFactorModal
      :is-open="show2FAModal"
      :enabled="twoFactorEnabled"
      @close="show2FAModal = false"
      @status-updated="handle2FAUpdated"
    />

    <RecoveryCodesModal
      :is-open="showRecoveryModal"
      @close="showRecoveryModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from '../../common/Button.vue';
import ChangeEmailModal from './ChangeEmailModal.vue';
import ChangePasswordModal from './ChangePasswordModal.vue';
import TwoFactorModal from './TwoFactorModal.vue';
import RecoveryCodesModal from './RecoveryCodesModal.vue';
// import { useDashboardData } from '~/composables/useDashboardData';

// Modal states
const showEmailModal = ref(false);
const showPasswordModal = ref(false);
const show2FAModal = ref(false);
const showRecoveryModal = ref(false);

// const { dashboardData } = useDashboardData(); //TODO
// Mock data for dashboard
const dashboardData = ref({
  user: {
    name: 'John Doe',
    email: 'fjaskd@afs.com',
    avatar: '/default-avatar.png'
  }
});

// Data initialization - get from API or use mock as fallback
const userInfo = computed(() => {
  if (dashboardData.value && 'user' in dashboardData.value) {
    return {
      email: dashboardData.value.user.email
    };
  }
  throw new Error('User data not found');
});

const twoFactorEnabled = ref(true);

const activeSessions = ref([
  {
    id: 1,
    device: 'Chrome on Windows',
    location: 'New York, NY',
    lastActive: '2 minutes ago',
    current: true
  },
  {
    id: 2,
    device: 'Safari on iPhone',
    location: 'New York, NY',
    lastActive: '1 hour ago',
    current: false
  },
  {
    id: 3,
    device: 'Chrome on Mac',
    location: 'New York, NY',
    lastActive: '2 days ago',
    current: false
  }
]);

// Methods
const editEmail = () => {
  showEmailModal.value = true;
};

const editPassword = () => {
  showPasswordModal.value = true;
};

const toggle2FA = () => {
  if (twoFactorEnabled.value) {
    show2FAModal.value = true;
  } else {
    // Disable 2FA
    twoFactorEnabled.value = false;
  }
};

const manage2FA = () => {
  show2FAModal.value = true;
};

const viewRecoveryCodes = () => {
  showRecoveryModal.value = true;
};

const revokeSession = (sessionId: number) => {
  if (confirm('Are you sure you want to revoke this session?')) {
    activeSessions.value = activeSessions.value.filter((session) => session.id !== sessionId);
  }
};

const revokeAllSessions = () => {
  if (confirm('Are you sure you want to sign out of all other sessions? You will need to sign in again on those devices.')) {
    activeSessions.value = activeSessions.value.filter((session) => session.current);
  }
};

// Event handlers
const handleEmailUpdated = (newEmail: string) => {
  userInfo.value.email = newEmail;
};

const handlePasswordUpdated = () => {
  // Password updated successfully
};

const handle2FAUpdated = (enabled: boolean) => {
  twoFactorEnabled.value = enabled;
};
</script>
