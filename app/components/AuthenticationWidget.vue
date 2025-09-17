<template>
  <div class="flex gap-4 items-center">
    <!-- Loading state - skeleton -->
    <div v-if="!userInitialized" class="flex gap-4 items-center">
      <!-- Skeleton for buttons (most common case) -->
      <div class="w-16 h-8 bg-gray-200 rounded animate-pulse" />
    </div>
    <!-- Logged in state -->
    <div v-else-if="user.isLoggedIn" class="relative">
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
          @click="routeTo('/dashboard?tab=settings')"
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
          @click="routeTo('/dashboard?tab=study')"
        >
          Study
        </button>
        <button
          class="block w-full text-left px-4 py-2 hover:bg-gray-100"
          @click="routeTo('/about?tab=feedback')"
        >
          Feedback
        </button>
        <button
          class="block w-full text-left px-4 py-2 hover:bg-gray-100"
          @click="routeTo('/about')"
        >
          About
        </button>
        <div class="border-t my-1" />

        <button
          class="block w-full text-left px-4 py-2 hover:bg-gray-100"
          @click="openSubscriptionModal"
        >
          Upgrade Plan
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

  <!-- Subscription Modal -->
  <SubscriptionModal
    v-if="subscriptionModalVisible"
    :is-visible="subscriptionModalVisible"
    @close="subscriptionModalVisible = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import SubscriptionModal from './subscription/SubscriptionModal.vue';
import UserAvatar from './common/UserAvatar.vue';
import { useAuth } from '~/composables/useAuth';
import { useToast } from '#imports';
import Button from '~/components/common/Button.vue';
import { useMeStore } from '~/stores/me';

// Emits for parent component communication
const emit = defineEmits(['login-success', 'register-success', 'logout']);

const toast = useToast();
const router = useRouter();
const menuOpen = ref(false);
const subscriptionModalVisible = ref(false);

const { signOut } = useAuth();
const user = useMeStore();

// Add local state
const userInitialized = ref(false);

// Watch store state
watch(() => user.isInitialized, (isInitialized) => {
  userInitialized.value = !!isInitialized;
}, { immediate: true });

// Navigation helper
const routeTo = (path: string) => {
  router.push(path);
  menuOpen.value = false;
};

// Authentication actions
const login = () => {
  router.push('/login');
};

const register = () => {
  router.push('/register');
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
