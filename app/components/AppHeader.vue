<template>
  <div class="relative z-10 p-4 sm:p-8 bg-white">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <img src="/logo.png" class="w-[40px] sm:w-[50px] h-auto mr-3">
        <h1 class="text-gray-800 text-xl sm:text-2xl font-bold">Eddy</h1>
      </div>
      <div class="flex gap-4 items-center">
        <!-- Logged in state -->
        <div v-if="isLoggedIn" class="flex items-center gap-3">
          <span class="text-sm text-gray-700">Welcome, {{ currentUserDisplayName }}</span>
          <Button
            variant="secondary"
            :loading="isLoggingOut"
            :text="isLoggingOut ? 'Logging out...' : 'Logout'"
            @click="handleLogout"
          />
          <!-- TODO: Add user menu dropdown with profile, settings, etc. -->
        </div>

        <!-- Not logged in state -->
        <div v-else class="flex gap-4">
          <Button variant="primary" text="Login" @click="login" />
          <Button
            variant="secondary"
            text="Register for Free"
            @click="register"
          />
        </div>
      </div>
    </div>
  </div>

  <LoginModal
    v-if="loginModalVisible"
    @close="loginModalVisible = false"
    @success="handleLoginSuccess"
    @register="register"
  />
  <RegisterModal
    v-if="registerModalVisible"
    @close="registerModalVisible = false"
    @success="handleRegisterSuccess"
    @login="login"
  />
</template>

<script setup>
import { ref } from 'vue';
import LoginModal from './login/LoginModal.vue';
import RegisterModal from './register/RegisterModal.vue';
import Button from '~/components/common/Button.vue';
import { useAuth } from '~/composables/useAuth';
import { useSupabaseUser } from '#imports';

const { signOut } = useAuth();
const user = useSupabaseUser();
const isLoggedIn = computed(() => !!user.value);
console.log('Current user:', user.value);
const currentUserDisplayName = computed(() => user.value?.email || '');

const loginModalVisible = ref(false);
const registerModalVisible = ref(false);
const isLoggingOut = ref(false);

const login = () => {
  registerModalVisible.value = false;
  loginModalVisible.value = true;
};

const register = () => {
  loginModalVisible.value = false;
  registerModalVisible.value = true;
};

const handleLoginSuccess = () => {
  loginModalVisible.value = false;
  // TODO: Redirect to dashboard or appropriate page
  // TODO: Show success notification
};

const handleRegisterSuccess = () => {
  registerModalVisible.value = false;
  // TODO: Redirect to dashboard or appropriate page
  // TODO: Show success notification
};

const handleLogout = async () => {
  isLoggingOut.value = true;
  try {
    await signOut();
    // TODO: Show logout success message
  } catch (error) {
    console.error('Logout failed:', error);
    // TODO: Show error message
  } finally {
    isLoggingOut.value = false;
  }
};
</script>
