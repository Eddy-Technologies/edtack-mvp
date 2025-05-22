<template>
  <div class="min-h-screen bg-background flex flex-col md:flex-row">
    <!-- Left Form Section -->
    <div class="flex-1 flex items-center justify-center px-6 py-10">
      <form class="w-full max-w-md space-y-5 bg-white p-6 rounded-lg" @submit.prevent="handleLogin">
        <!-- Back Icon -->
        <div class="flex items-center mb-2">
          <UIcon
            name="i-heroicons-arrow-left"
            class="icon cursor-pointer w-6 h-6 shrink-0 px-4"
            @click="routeTo('/')"
          />
          <div class="flex-1 text-center">
            <h1 class="text-2xl font-bold text-gray-800 font-serif">Login to Eddy</h1>
          </div>
        </div>

        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="w-full p-3 border rounded border-gray-300 focus:ring focus:ring-blue-400 bg-white"
          required
        >
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full p-3 border rounded border-gray-300 focus:ring focus:ring-blue-400 bg-white"
          required
        >

        <div class="text-center">
          <button
            type="submit"
            class="w-[220px] py-2 rounded-lg border-2 border-black font-bold cursor-pointer bg-white text-black hover:bg-gray-200 text-base sm:text-lg md:text-xl transition-colors duration-300"
          >
            Login
          </button>
        </div>

        <p class="text-center text-sm mt-4 text-black">
          Don't have an account?
          <a class="text-primary cursor-pointer font-semibold hover:underline" @click="routeTo('/register')">Sign up</a>
        </p>
      </form>
    </div>

    <!-- Right Feature Section -->
    <Placeholder />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useSupabaseUser } from '#imports';
import { useRouter, navigateTo } from '#app';
import Placeholder from '~/components/login/Placeholder.vue';
import { useUsers } from '~/composables/useUsers';

const user = useSupabaseUser();
const router = useRouter();
const routeTo = (route) => router.push(route);

const email = ref('');
const password = ref('');
const errorMessage = ref('');

const { login } = useUsers();
const toast = useToast();

console.log('[Login Component] Component mounted. Initial user.value:', user.value ? user.value.email : 'null');

const handleLogin = async () => {
  errorMessage.value = '';

  try {
    await login(email.value, password.value);
    toast.add({
      title: 'Success',
      description: 'Login successful! Redirecting...',
      timeout: 2000,
      icon: 'check',
      color: 'green'
    });
    console.log('[Login Component] After login() resolves, immediate user.value:', user.value ? user.value.email : 'null');
  } catch (error) {
    console.error('[Login Component] Login failed:', error);

    errorMessage.value = error?.message || 'An unexpected login error occurred.';

    toast.add({
      title: 'Request Error',
      description: errorMessage.value,
      timeout: 10000,
      icon: 'i-heroicons-exclamation-triangle-16-solid',
      color: 'red',
    });
  }
};

watch(user, async (newUser, oldUser) => {
  console.log(`[Login Component] WATCHER triggered. Old user: ${oldUser ? oldUser.email : 'null'}, New user: ${newUser ? newUser.email : 'null'}`);
  if (newUser) {
    console.log('[Login Component] WATCHER: User state became non-null. Initiating navigation...');
    // Ensure navigateTo is only called once if already on dashboard or navigating
    if (router.currentRoute.value.path !== '/dashboard') { // Prevent navigating if already there
      await navigateTo('/dashboard');
    }
  }
}, { immediate: true });
</script>
