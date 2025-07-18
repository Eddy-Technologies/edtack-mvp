<template>
  <div class="flex gap-4 items-center">
    <!-- Logged in state -->
    <div v-if="meIsLoading" class="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
    <div v-else-if="user.isLoggedIn && !meIsLoading" class="relative">
      <UserAvatar @click="menuOpen = !menuOpen" />
      <!-- Dropdown Menu -->
      <div
        v-if="menuOpen"
        class="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-20"
      >
        <button
          class="block w-full text-left px-4 py-2 hover:bg-gray-100"
          @click="routeTo('/dashboard?tab=overview')"
        >
          Profile
        </button>
        <button
          class="block w-full text-left px-4 py-2 hover:bg-gray-100"
          @click="routeTo('/dashboard?tab=security')"
        >
          Settings
        </button>
        <button
          class="block w-full text-left px-4 py-2 hover:bg-gray-100"
          @click="routeTo('/dashboard?tab=shop')"
        >
          Shop
        </button>
        <button
          class="block w-full text-left px-4 py-2 hover:bg-gray-100"
          @click="routeTo('/feedback')"
        >
          Feedback
        </button>
        <div class="border-t my-1" />

        <button
          class="block w-full text-left px-4 py-2 hover:bg-gray-100"
          @click="openSubscriptionModal"
        >
          Subscription
        </button>
        <div class="border-t my-1" />
        <button
          class="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Not logged in state -->
    <div v-else class="flex gap-4">
      <slot name="login-buttons">
        <!-- Default login buttons -->
        <Button variant="primary" text="Login" @click="login" />
        <Button variant="secondary" text="Register" @click="register" />
      </slot>
    </div>
  </div>

  <!-- Login Modal -->
  <LoginModal
    v-if="loginModalVisible"
    @close="loginModalVisible = false"
    @success="handleLoginSuccess"
    @register="register"
  />

  <!-- Register Modal -->
  <RegisterModal
    v-if="registerModalVisible"
    @close="registerModalVisible = false"
    @success="handleRegisterSuccess"
    @login="login"
  />

  <!-- Subscription Modal -->
  <SubscriptionModal
    v-if="subscriptionModalVisible"
    :is-visible="subscriptionModalVisible"
    @close="subscriptionModalVisible = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import LoginModal from './login/LoginModal.vue';
import RegisterModal from './register/RegisterModal.vue';
import SubscriptionModal from './subscription/SubscriptionModal.vue';
import UserAvatar from './dashboard/common/UserAvatar.vue';
import { useAuth } from '~/composables/useAuth';
import { useToast } from '#imports';
import Button from '~/components/common/Button.vue';
import { useMeStore } from '~/stores/me';
import { useMe } from '~/composables/useMe';

const { meIsLoading } = useMe();

// Props for customization
interface Props {
  showLoginButtons?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showLoginButtons: true
});

// Emits for parent component communication
const emit = defineEmits(['login-success', 'register-success', 'logout']);

const toast = useToast();
const router = useRouter();
const menuOpen = ref(false);
const loginModalVisible = ref(false);
const registerModalVisible = ref(false);
const subscriptionModalVisible = ref(false);

const { signOut } = useAuth();
const user = useMeStore();

// Navigation helper
const routeTo = (path: string) => {
  router.push(path);
  menuOpen.value = false;
};

// Authentication actions
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
  emit('login-success');
};

const handleRegisterSuccess = () => {
  registerModalVisible.value = false;
  emit('register-success');
};

const openSubscriptionModal = () => {
  subscriptionModalVisible.value = true;
  menuOpen.value = false;
};

const handleLogout = async () => {
  menuOpen.value = false;
  try {
    await signOut();
    emit('logout');
    toast.add({
      title: 'Logged out successfully',
      description: 'See you next time!',
      color: 'green'
    });
  } catch (error) {
    console.error('Logout failed:', error);
    toast.add({
      title: 'Logout failed',
      description: 'Please try again',
      color: 'red'
    });
  }
};

// Click outside handler
const onClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.relative')) {
    menuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside);
});
</script>
