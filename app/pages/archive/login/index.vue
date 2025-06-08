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
          v-model="identifier"
          type="text"
          placeholder="Email or Username"
          class="w-full p-3 border rounded border-gray-300 focus:ring focus:ring-primary-500 bg-white"
          required
        >
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full p-3 border rounded border-gray-300 focus:ring focus:ring-primary-500 bg-white"
          required
        >

        <div class="text-center">
          <Button
            text="Login"
            color="white"
            size="xl"
            bold
            rounded
            border
            hover
            extra-classes="w-[220px] text-base sm:text-lg md:text-xl"
          />
        </div>

        <p class="text-center text-sm mt-4 text-black">
          Don't have an account?
          <a
            class="text-primary cursor-pointer font-semibold hover:underline"
            @click="routeTo('/register')"
          >Sign up</a>
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
import Button from '~/components/common/Button.vue';
import Placeholder from '~/components/login/Placeholder.vue';
import { useUsers } from '~/composables/useUsers';
import { isValidEmail } from '~/utils/emailUtils';

const user = useSupabaseUser(); // Supabase Auth user
const router = useRouter();
const routeTo = (route) => router.push(route);

const identifier = ref(''); // Can be email or username
const password = ref('');

const { loginEmail, loginUsername, currentAppUser } = useUsers();

const toast = useToast();

// console.log('[Login Component] Component mounted. Initial user.value:', user.value ? user.value.email : 'null');
// console.log('[Login Component] Component mounted. Initial currentAppUser.value:', currentAppUser.value ? currentAppUser.value.username : 'null');

const handleLogin = async () => {
  const currentIdentifier = identifier.value;
  const currentPassword = password.value;

  if (!currentIdentifier || !currentPassword) {
    showErrorToast('Email/Username and password are required.');
    return;
  }

  const isEmail = isValidEmail(currentIdentifier);
  // Attempt 1: Login with email if format is valid
  if (isEmail) {
    console.log(
      `[Login Component] Input '${currentIdentifier}' is in email format. Attempting email login...`
    );
    try {
      await loginEmail(currentIdentifier, currentPassword);
      console.log('[Login Component] Email login successful.');
      showSuccessToast('Email login successful!');
      await navigateTo('/dashboard');
      return; // Exit if successful
    } catch (emailError) {
      console.warn(
        `[Login Component] Email login for '${currentIdentifier}' failed. Proceeding to attempt username login with the same credentials.`,
        emailError
      );
      // Don't show error to user yet, give username login a chance.
    }
  }

  // Attempt 2: Login with username
  // This will run if:
  // a) Input was not in email format OR
  // b) Input was in email format, but email login failed.
  if (!isEmail) {
    console.log(
      `[Login Component] Input '${currentIdentifier}' is not in email format. Attempting username login...`
    );
  } else {
    // This log indicates we're trying username after an email attempt.
    console.log(
      `[Login Component] Attempting username login with '${currentIdentifier}' (after email attempt failed or was skipped)...`
    );
  }

  try {
    const response = await loginUsername(currentIdentifier, currentPassword);
    console.log('[Login Component] Username login successful:', response);
    showSuccessToast('Username login successful!');
    await navigateTo('/dashboard');
  } catch (usernameError) {
    console.error('[Login Component] Username login failed:', usernameError);
    const message =
      usernameError?.statusMessage ||
      usernameError?.message ||
      'Invalid email/username or password.';
    showErrorToast(message);
  }
};

const showSuccessToast = (message) => {
  toast.add({
    title: 'Success',
    description: message,
    timeout: 2000,
    icon: 'i-heroicons-check-circle-solid',
    color: 'green',
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
watch(
  user,
  async (newUser) => {
    // console.log(`[Login Component] Supabase User WATCHER triggered. New user: ${newUser ? newUser.email : 'null'}`);
    if (newUser) {
      // console.log('[Login Component] WATCHER: Supabase user became non-null. Initiating navigation...');
      if (router.currentRoute.value.path !== '/dashboard') {
        await navigateTo('/dashboard');
      }
    }
  },
  { immediate: true }
);

// Watcher for custom App User (username/password)
watch(
  currentAppUser,
  async (newAppUser) => {
    // console.log(`[Login Component] App User WATCHER triggered. New app user: ${newAppUser ? newAppUser.username : 'null'}`);
    if (newAppUser) {
      // console.log('[Login Component] WATCHER: App user became non-null. Initiating navigation...');
      if (router.currentRoute.value.path !== '/dashboard') {
        await navigateTo('/dashboard');
      }
    }
  },
  { immediate: true }
);
</script>
