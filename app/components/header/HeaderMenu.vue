<template>
  <div class="relative">
    <!-- Desktop Menu -->
    <div class="hidden md:flex items-center gap-x-4">
      <UIcon
        name="i-heroicons-currency-dollar-16-solid"
        class="h-5 w-5 text-white-400 dark:text-white-500"
      />
      <span class="text-l font-bold text-gray-700 dark:text-gray-200">{{ credits }}</span>

      <ULink class="text-l font-semibold text-primary flex items-center gap-x-2" to="/store">
        Store
      </ULink>

      <ULink
        class="text-l font-semibold text-primary flex items-center gap-x-2"
        to="https://forms.gle/dDxMkSmAa1yJNuL28"
      >
        Feedback
      </ULink>

      <UIcon
          class="text-l font-semibold text-primary flex items-center gap-x-2"
          to="https://forms.gle/dDxMkSmAa1yJNuL28"
      >
        Logout
      </UIcon>
      <!-- Not logged in -->
      <UButton v-if="isAuthenticated" to="login" icon="i-heroicons-arrow-right-start-on-rectangle" color="primary">
        Logout
      </UButton>
      <!-- Not logged in -->
      <UButton v-else to="login" icon="i-heroicons-arrow-right-end-on-rectangle" color="primary">
        Login
      </UButton>
      <!--ColorMode />-->
    </div>

    <!-- Mobile Menu Button -->
    <div class="block md:hidden">
      <!--ColorMode />-->
      <button class="ml-4 focus:outline-none" @click="toggleMobileMenu">
        <UIcon name="i-heroicons-bars-3-16-solid" class="h-5 w-5 mt-1" />
      </button>
    </div>

    <!-- Mobile Menu Dropdown with Transition -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="showMobileMenu"
        class="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-900 shadow-lg rounded-md p-4 z-50 md:hidden"
      >
        <div class="flex items-center justify-end gap-x-2 mb-2">
          <UIcon
            name="i-heroicons-currency-dollar-16-solid"
            class="h-5 w-5 text-white-400 dark:text-white-500"
          />
          <span class="text-sm text-gray-700 dark:text-gray-200">{{ credits }}</span>
        </div>

        <div class="flex flex-col items-end gap-y-2 text-right">
          <ULink class="text-primary" to="/store">Store</ULink>
          <ULink class="text-primary" to="https://forms.gle/dDxMkSmAa1yJNuL28">
            Feedback
          </ULink>
        </div>
        <!-- Not logged in -->
        <UButton v-if="isAuthenticated" to="login" icon="i-heroicons-arrow-right-start-on-rectangle" color="primary">
          Logout
        </UButton>
        <!-- Not logged in -->
        <UButton v-else to="login" icon="i-heroicons-arrow-right-end-on-rectangle" color="primary">
          Login
        </UButton>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUsers } from '~/composables/useUsers';

defineProps({
  credits: {
    type: [String, Number],
    required: true,
  },
});
const isAuthenticated = computed(() => currentAppUser !== null);
const { currentAppUser } = useUsers(); // Get currentAppUser

const showMobileMenu = ref(false);
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};
</script>
