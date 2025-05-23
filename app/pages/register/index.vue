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
          <div class="text-center text-gray-800 mb-4">
            <h2 class="text-xl font-bold font-serif">Using Email</h2>
            <span class="text-sm text-gray-500">
              or <a class="text-primary cursor-pointer font-semibold hover:underline" @click="toggleRegistrationMethod">username</a>
            </span>
          </div>

          <div class="flex space-x-4">
            <input
              v-model="firstName"
              type="text"
              placeholder="First Name"
              class="w-1/2 p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white text-black"
              required
            >
            <input
              v-model="lastName"
              type="text"
              placeholder="Last Name"
              class="w-1/2 p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white text-black"
              required
            >
          </div>
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
              Using Email
            </button>
          </div>
        </form>

        <form v-else class="space-y-5" @submit.prevent="handleUsernameRegister">
          <div class="text-center text-gray-800">
            <h2 class="text-xl font-bold font-serif">Using Username</h2>
            <span class="text-sm text-gray-500">
              or <a class="text-primary cursor-pointer font-semibold hover:underline" @click="toggleRegistrationMethod">email</a>
            </span>
          </div>

          <p class="text-center text-xs text-red-600 font-medium mb-4">
            * For students without email. This option provides limited features.
          </p>

          <div class="flex space-x-4">
            <input
              v-model="firstName"
              type="text"
              placeholder="First Name"
              class="w-1/2 p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white text-black"
              required
            >
            <input
              v-model="lastName"
              type="text"
              placeholder="Last Name"
              class="w-1/2 p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white text-black"
              required
            >
          </div>

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
              Using Username
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

const { signupEmail, signupUsername } = useUsers();
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
    await signupEmail(email.value, password.value);

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
    console.log('Attempting username registration via useUsers.signupUsername:', { firstName: firstName.value, lastName: lastName.value, username: username.value });

    // Call the new signupUsername function from useUsers
    const response = await signupUsername({
      firstName: firstName.value,
      lastName: lastName.value,
      username: username.value,
      password: usernamePassword.value,
    });

    console.log('Registration response from signupUsername:', response);

    toast.add({
      title: 'Registration Successful',
      description: response.message || 'You can now log in with your username.',
      timeout: 5000,
      icon: 'i-heroicons-check-circle-20-solid',
      color: 'green'
    });
    navigateTo('/login');
  } catch (error) {
    console.error('Username registration failed:', error);
    const errorMessage = error?.data?.statusMessage || error?.message || 'An unexpected error occurred during username registration.';
    toast.add({
      title: 'Registration Error',
      description: errorMessage,
      timeout: 10000,
      icon: 'i-heroicons-exclamation-triangle-16-solid',
      color: 'red',
    });
  }
};
</script>
