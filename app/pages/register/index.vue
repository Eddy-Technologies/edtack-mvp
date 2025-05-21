<template>
  <div class="min-h-screen bg-background flex flex-col md:flex-row">
    <div class="flex-1 flex items-center justify-center px-6 py-10">
      <div class="w-full max-w-md space-y-5 bg-white p-6 rounded-lg shadow-lg">
        <div class="flex items-center mb-2">
          <UIcon
            name="i-heroicons-arrow-left"
            class="cursor-pointer w-6 h-6 text-gray-800 hover:text-gray-600"
            @click="routeTo('/')"
          />
          <div class="flex-1 text-center">
            <h1 class="text-2xl font-bold text-gray-800 font-serif">Register for Eddy</h1>
          </div>
        </div>

        <form v-if="showEmailRegister" class="space-y-5" @submit.prevent="handleRegister">
          <h2 class="text-xl font-bold text-gray-800 text-center font-serif">Register with Email</h2>
          <p class="text-center text-sm text-gray-500 -mt-3 mb-4">
            or <a class="text-primary cursor-pointer font-semibold hover:underline" @click="toggleRegistrationMethod">username</a>
          </p>

          <input
            v-model="firstName"
            type="text"
            placeholder="First Name"
            class="w-full p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white text-black"
            required
          >
          <input
            v-model="lastName"
            type="text"
            placeholder="Last Name"
            class="w-full p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white text-black"
            required
          >
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white text-black"
            required
          >
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="w-full p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white text-black"
            required
          >

          <div class="flex items-start space-x-2 text-sm text-gray-600">
            <input type="checkbox" required class="mt-1">
            <p class="text-sm text-black">
              I agree to the
              <a href="#" class="text-primary underline">terms of use</a> and
              <a href="#" class="text-primary underline">privacy policy</a>
            </p>
          </div>

          <div class="text-center">
            <button
              type="submit"
              class="w-[220px] py-2 rounded-lg border-2 border-black font-bold cursor-pointer bg-white text-black hover:bg-gray-200 text-base sm:text-lg md:text-xl transition-colors duration-300"
            >
              Register with Email
            </button>
          </div>
        </form>

        <form v-else class="space-y-5" @submit.prevent="handleUsernameRegister">
          <h2 class="text-xl font-bold text-gray-800 text-center font-serif">Register with Username</h2>
          <p class="text-center text-sm text-gray-500 -mt-3 mb-4">
            or <a class="text-primary cursor-pointer font-semibold hover:underline" @click="toggleRegistrationMethod">email</a>
          </p>

          <p class="text-center text-xs text-red-600 font-medium mb-4">
            * For students without email. This option provides limited features.
          </p>

          <input
            v-model="firstName"
            type="text"
            placeholder="First Name"
            class="w-full p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white text-black"
            required
          >
          <input
            v-model="lastName"
            type="text"
            placeholder="Last Name"
            class="w-full p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white text-black"
            required
          >

          <input
            v-model="username"
            type="text"
            placeholder="Username"
            class="w-full p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white text-black"
            required
          >
          <input
            v-model="usernamePassword"
            type="password"
            placeholder="Password"
            class="w-full p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white text-black"
            required
          >

          <div class="flex items-start space-x-2 text-sm text-gray-600">
            <input type="checkbox" required class="mt-1">
            <p class="text-sm text-black">
              I agree to the
              <a href="#" class="text-primary underline">terms of use</a> and
              <a href="#" class="text-primary underline">privacy policy</a>
            </p>
          </div>

          <div class="text-center">
            <button
              type="submit"
              class="w-[220px] py-2 rounded-lg border-2 border-black font-bold cursor-pointer bg-white text-black hover:bg-gray-200 text-base sm:text-lg md:text-xl transition-colors duration-300"
            >
              Register with Username
            </button>
          </div>
        </form>

        <div class="text-center mt-5 space-y-3">
          <button
            type="button"
            class="w-[220px] py-2 rounded-lg border-2 border-black font-bold cursor-pointer bg-white text-black hover:bg-gray-200 text-base sm:text-lg md:text-xl transition-colors duration-300"
            @click="routeTo('/child')"
          >
            Continue as Guest
          </button>
          <p class="text-center text-sm mt-4 text-black">
            Already have an account?
            <a class="text-primary cursor-pointer font-semibold hover:underline" @click="routeTo('/login')">Sign in</a>
          </p>
        </div>
      </div>
    </div>

    <Placeholder />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, navigateTo } from '#app';
import Placeholder from '~/components/login/Placeholder.vue';
import { useUsers } from '~/composables/useUsers';
import { useToast } from '#imports';

const router = useRouter();
const routeTo = (route) => router.push(route);

// Reactive state to control which form is shown
const showEmailRegister = ref(true); // true means email form is shown by default

// Form inputs for email registration (also used by username registration now)
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');

// New form inputs for username-only registration
const username = ref('');
const usernamePassword = ref('');

const { signup, addAppUser } = useUsers();
const toast = useToast();

// Function to toggle between email and username registration forms
const toggleRegistrationMethod = () => {
  showEmailRegister.value = !showEmailRegister.value;
  // Optionally clear form fields when switching to avoid stale data
  firstName.value = '';
  lastName.value = '';
  email.value = '';
  password.value = '';
  username.value = '';
  usernamePassword.value = '';
};

// Handler for Email-based Registration
const handleRegister = async () => {
  try {
    console.log('Registering user with email:', { firstName: firstName.value, lastName: lastName.value, email: email.value, password: password.value });
    await signup(email.value, password.value);

    toast.add({
      title: 'Registration Successful',
      description: 'Please check your email to confirm your account.',
      timeout: 5000,
      icon: 'i-heroicons-check-circle-20-solid',
      color: 'green'
    });
    navigateTo('/login'); // Redirect to login page
  } catch (error) {
    console.error('Email registration failed:', error);
    toast.add({
      title: 'Registration Error',
      description: error?.message || 'An unexpected error occurred during email registration.',
      timeout: 10000,
      icon: 'i-heroicons-exclamation-triangle-16-solid',
      color: 'red',
    });
  }
};

// Handler for Username-only Registration
const handleUsernameRegister = async () => {
  try {
    // IMPORTANT SECURITY NOTE:
    // Passwords MUST be hashed on the server-side (e.g., in a Nuxt server route
    // that calls addAppUser) before being stored in your 'app_users' table.
    // Storing plain passwords (usernamePassword.value) directly is a severe security risk.
    // Your `addAppUser` function currently just inserts the provided userData.
    // Ensure your backend handles hashing if you pass plain password from here.

    console.log('Registering user with username:', {
      firstName: firstName.value, // Pass first name
      lastName: lastName.value, // Pass last name
      username: username.value,
      password: usernamePassword.value
    });
    await addAppUser({
      firstName: firstName.value,
      lastName: lastName.value,
      username: username.value,
      password: usernamePassword.value
    });

    toast.add({
      title: 'Registration Successful',
      description: 'You can now log in with your username.',
      timeout: 5000,
      icon: 'i-heroicons-check-circle-20-solid',
      color: 'green'
    });
    navigateTo('/login'); // Redirect to login page
  } catch (error) {
    console.error('Username registration failed:', error);
    toast.add({
      title: 'Registration Error',
      description: error?.message || 'An unexpected error occurred during username registration.',
      timeout: 10000,
      icon: 'i-heroicons-exclamation-triangle-16-solid',
      color: 'red',
    });
  }
};
</script>
