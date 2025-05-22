<template>
  <div class="min-h-screen bg-background flex flex-col md:flex-row">
    <div class="flex-1 flex items-center justify-center px-6 py-10">
      <form class="w-full max-w-md space-y-5 bg-white p-6 rounded-lg" @submit.prevent="handleLogin">
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
          type="text"
          placeholder="Email or Username"
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

    <Placeholder />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useSupabaseUser } from '#imports';
import { useRouter, navigateTo } from '#app';
import Placeholder from '~/components/login/Placeholder.vue';
import { useUsers } from '~/composables/useUsers';

const user = useSupabaseUser(); // Supabase Auth user
const router = useRouter();
const routeTo = (route) => router.push(route);

const email = ref(''); // This field will now hold either email or username
const password = ref('');
const errorMessage = ref('');

const { loginEmail, loginUsername, currentAppUser } = useUsers(); // Get currentAppUser

const toast = useToast();

// console.log('[Login Component] Component mounted. Initial user.value:', user.value ? user.value.email : 'null');
// console.log('[Login Component] Component mounted. Initial currentAppUser.value:', currentAppUser.value ? currentAppUser.value.username : 'null');

const handleLogin = async () => {
  errorMessage.value = '';

  try {
    // Attempt Email Login first
    console.log('[Login Component] Attempting email login...');
    await loginEmail(email.value, password.value);
    console.log('[Login Component] Email login successful.');
    showSuccessToast('Email login successful!');
    await navigateTo('/dashboard');
    return; // Exit if successful
  } catch (emailError) {
    console.warn('[Login Component] Email login failed. Trying username login...', emailError);
    // If email login fails, try username login if the field is not empty
    if (email.value) { // Check if the input field has a value to use as username
      try {
        console.log('[Login Component] Attempting username login...');
        const response = await loginUsername(email.value, password.value); // Use 'email' field as username
        console.log('[Login Component] Username login successful:', response);
        showSuccessToast('Username login successful!');
        await navigateTo('/dashboard');
        return; // Exit if successful
      } catch (usernameError) {
        console.error('[Login Component] Username login failed:', usernameError);
        errorMessage.value = usernameError?.statusMessage || usernameError?.message || 'Invalid username or password.';
      }
    } else {
      // If email field was empty and email login failed (unlikely, but for completeness)
      errorMessage.value = emailError?.statusMessage || emailError?.message || 'Invalid email or password.';
    }
  }

  // If we reach here, both login attempts failed or an initial validation failed
  if (errorMessage.value) {
    showErrorToast(errorMessage.value);
  } else {
    // Fallback for unexpected scenarios
    showErrorToast('An unexpected login error occurred. Please try again.');
  }
};

const showSuccessToast = (message) => {
  toast.add({
    title: 'Success',
    description: message,
    timeout: 2000,
    icon: 'i-heroicons-check-circle-solid',
    color: 'green'
  });
};

const showErrorToast = (message) => {
  toast.add({
    title: 'Login Failed',
    description: message,
    timeout: 10000,
    icon: 'i-heroicons-exclamation-triangle-16-solid',
    color: 'red',
  });
};

// Watcher for Supabase Auth user (email/OAuth)
watch(user, async (newUser) => {
  // console.log(`[Login Component] Supabase User WATCHER triggered. New user: ${newUser ? newUser.email : 'null'}`);
  if (newUser) {
    // console.log('[Login Component] WATCHER: Supabase user became non-null. Initiating navigation...');
    if (router.currentRoute.value.path !== '/dashboard') {
      await navigateTo('/dashboard');
    }
  }
}, { immediate: true });

// Watcher for custom App User (username/password)
watch(currentAppUser, async (newAppUser) => {
  // console.log(`[Login Component] App User WATCHER triggered. New app user: ${newAppUser ? newAppUser.username : 'null'}`);
  if (newAppUser) {
    // console.log('[Login Component] WATCHER: App user became non-null. Initiating navigation...');
    if (router.currentRoute.value.path !== '/dashboard') {
      await navigateTo('/dashboard');
    }
  }
}, { immediate: true });
</script>
