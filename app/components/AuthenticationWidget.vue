<template>
  <!-- Sidebar variant - minimalistic like Claude UI -->
  <div v-if="variant === 'sidebar'" class="w-full">
    <ClientOnly>
      <!-- Loading state while initializing -->
      <div v-if="meStore.isLoading && !meStore.user_role" class="p-2">
        <div class="animate-pulse flex items-center gap-3 p-2">
          <div class="w-8 h-8 bg-gray-200 rounded-full" />
          <div class="flex-1 space-y-2">
            <div class="h-3 bg-gray-200 rounded w-3/4" />
            <div class="h-2 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>

      <div v-else-if="isLoggedIn" ref="menuContainer" class="relative">
        <!-- Trigger: Avatar + Name + Plan -->
        <button
          ref="triggerButton"
          class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          @click="toggleMenu"
        >
          <UserAvatar size="small" />
          <div v-if="!collapsed" class="flex-1 text-left min-w-0">
            <div class="text-sm font-medium text-gray-900 truncate">
              {{ meStore.userDisplayFullName }}
            </div>
            <div class="text-xs text-gray-500">
              {{ tierDisplayName }}
            </div>
          </div>
          <Icon
            v-if="!collapsed"
            :name="menuOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
            class="w-4 h-4 text-gray-400 flex-shrink-0"
          />
        </button>

        <!-- Dropdown Menu - opens upward -->
        <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div
            v-if="menuOpen"
            class="fixed bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            :class="isTourActive ? 'z-[10002]' : 'z-[9999]'"
            :style="{ bottom: `${dropdownPosition.bottom}px`, left: `${dropdownPosition.left}px`, width: `${dropdownPosition.width}px` }"
          >
            <div class="py-1">
              <button
                class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                data-tour="desktop-profile"
                @click="routeTo('/dashboard?tab=overview')"
              >
                <Icon name="i-heroicons-user" class="w-4 h-4" />
                Profile
              </button>
              <button
                class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                data-tour="desktop-study"
                @click="routeTo('/dashboard?tab=study')"
              >
                <Icon name="i-heroicons-book-open" class="w-4 h-4" />
                Study
              </button>
              <button
                class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                @click="routeTo('/dashboard?tab=settings')"
              >
                <Icon name="i-heroicons-cog-6-tooth" class="w-4 h-4" />
                Settings
              </button>
              <button
                class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                @click="routeTo('/about?tab=user-guides')"
              >
                <Icon name="i-heroicons-document-text" class="w-4 h-4" />
                User Guide
              </button>
            </div>

            <template v-if="subscriptionPlans">
              <div class="border-t border-gray-100" />

              <div class="py-1">
                <button
                  class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  @click="routeTo('/dashboard?tab=subscription')"
                >
                  <Icon name="i-heroicons-sparkles" class="w-4 h-4" />
                  Upgrade Plan
                </button>
              </div>
            </template>

            <div class="border-t border-gray-100" />

            <div class="py-1">
              <button
                class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                @click="handleLogout"
              >
                <Icon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Not logged in - sidebar variant -->
      <div v-else class="flex flex-col gap-2 p-2">
        <Button
          variant="primary"
          text="Login"
          size="sm"
          class="w-full"
          @click="login"
        />
        <Button
          variant="secondary"
          text="Register"
          size="sm"
          class="w-full"
          @click="register"
        />
      </div>

      <template #fallback>
        <div class="p-2">
          <div class="animate-pulse flex items-center gap-3 p-2">
            <div class="w-8 h-8 bg-gray-200 rounded-full" />
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-gray-200 rounded w-3/4" />
              <div class="h-2 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>

  <!-- Topbar variant - original design -->
  <div v-else class="flex gap-4 items-center">
    <div v-if="isLoggedIn" ref="menuContainer" class="relative">
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
        <button
          class="block w-full text-left px-4 py-2 hover:bg-gray-100"
          @click="routeTo('/about?tab=user-guides')"
        >
          User Guide
        </button>
        <template v-if="subscriptionPlans">
          <div class="border-t my-1" />

          <button
            class="block w-full text-left px-4 py-2 hover:bg-gray-100"
            @click="routeTo('/dashboard?tab=subscription')"
          >
            Upgrade Plan
          </button>
        </template>
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
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import UserAvatar from './common/UserAvatar.vue';
import { useAuth } from '~/composables/useAuth';
import { useToast } from '#imports';
import Button from '~/components/common/Button.vue';
import { useMeStore } from '~/stores/me';
import { useTokenUsage } from '~/composables/useTokenUsage';
import { useFeatureFlags } from '~/composables/useFeatureFlags';

interface Props {
  variant?: 'topbar' | 'sidebar';
  collapsed?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: 'topbar',
  collapsed: false,
});

// Emits for parent component communication
const emit = defineEmits(['login-success', 'register-success', 'logout']);

const toast = useToast();
const router = useRouter();
const menuOpen = ref(false);
const triggerButton = ref<HTMLElement | null>(null);
const dropdownPosition = ref({ bottom: 0, left: 0, width: 0 });

const { signOut } = useAuth();
const meStore = useMeStore();
const supabaseUser = useSupabaseUser();
const { tierDisplayName, fetchTokenUsage } = useTokenUsage();
const { subscriptionPlans } = useFeatureFlags();

// Auth state from Supabase, profile data from store
const isLoggedIn = computed(() => !!supabaseUser.value);

// Toggle menu and calculate position for fixed dropdown
const toggleMenu = () => {
  if (!menuOpen.value && triggerButton.value) {
    const rect = triggerButton.value.getBoundingClientRect();
    dropdownPosition.value = {
      bottom: window.innerHeight - rect.top + 8,
      left: rect.left,
      width: Math.max(rect.width, 180), // min 180px when sidebar is minimized
    };
  }
  menuOpen.value = !menuOpen.value;
};

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
const menuContainer = ref<HTMLElement | null>(null);
const isTourActive = ref(false); // Track if tour opened the menu

const onClickOutside = (e: MouseEvent) => {
  // Don't close menu if tour is active
  if (isTourActive.value) return;

  const target = e.target as HTMLElement;
  // Check if click is outside the menu container
  if (menuContainer.value && !menuContainer.value.contains(target)) {
    menuOpen.value = false;
  }
};

// Handler to open menu for tour
const handleOpenMenuForTour = () => {
  isTourActive.value = true;
  if (triggerButton.value) {
    const rect = triggerButton.value.getBoundingClientRect();
    dropdownPosition.value = {
      bottom: window.innerHeight - rect.top + 8,
      left: rect.left,
      width: Math.max(rect.width, 180),
    };
    menuOpen.value = true;
  }
};

// Handler to close menu when tour ends
const handleCloseMenuForTour = () => {
  isTourActive.value = false;
  menuOpen.value = false;
};

onMounted(() => {
  document.addEventListener('click', onClickOutside);
  if (typeof window !== 'undefined') {
    window.addEventListener('openAuthWidgetMenu', handleOpenMenuForTour);
    window.addEventListener('closeAuthWidgetMenu', handleCloseMenuForTour);
  }
  if (isLoggedIn.value) {
    fetchTokenUsage();
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside);
  if (typeof window !== 'undefined') {
    window.removeEventListener('openAuthWidgetMenu', handleOpenMenuForTour);
    window.removeEventListener('closeAuthWidgetMenu', handleCloseMenuForTour);
  }
});
</script>
