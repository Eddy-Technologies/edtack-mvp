<template>
  <div class="flex gap-4 items-center">
    <!-- Logged in state -->
    <div v-if="meIsLoading">TODO: spinner</div>
    <div v-else-if="isLoggedIn && !meIsLoading" class="relative">
      <div
        :class="[
          'w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 flex items-center justify-center text-white font-semibold text-sm',
          avatarColor
        ]"
        :title="`Welcome, ${currentUserDisplayName}`"
        @click="menuOpen = !menuOpen"
      >
        {{ userInitials }}
      </div>
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
          @click="routeTo('/dashboard?tab=account')"
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
import { storeToRefs } from 'pinia';
import LoginModal from './login/LoginModal.vue';
import RegisterModal from './register/RegisterModal.vue';
import SubscriptionModal from './subscription/SubscriptionModal.vue';
import { useAuth } from '~/composables/useAuth';
import { useSupabaseUser, useToast } from '#imports';
import { generateInitials, generateAvatarColor } from '~/utils/avatarUtils';
import Button from '~/components/common/Button.vue';
import { useMeStore } from '~/stores/me';

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
// const user = useSupabaseUser();
const meStore = useMeStore();
const { me: user, meIsLoading } = storeToRefs(meStore);

const isLoggedIn = computed(() => !!user.value);

// User display name
const currentUserDisplayName = computed(() => {
  if (!user.value) return '';

  const firstName = user.value.user_metadata?.first_name;
  const lastName = user.value.user_metadata?.last_name;

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else {
    return user.value.email || '';
  }
});

// Generate user initials and avatar color
const userInitials = computed(() => {
  if (!user.value) return '';

  const firstName = user.value.user_metadata?.first_name;
  const lastName = user.value.user_metadata?.last_name;
  const email = user.value.email;

  return generateInitials(firstName, lastName, email);
});

const avatarColor = computed(() => {
  if (!user.value) return 'bg-gray-500';

  const firstName = user.value.user_metadata?.first_name;
  const lastName = user.value.user_metadata?.last_name;
  const email = user.value.email;

  // Use full name for color generation, fallback to email
  const nameForColor = firstName && lastName ?
    `${firstName} ${lastName}` :
    firstName || lastName || email || '';

  return generateAvatarColor(nameForColor);
});

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
