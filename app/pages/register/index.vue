<template>
  <div class="min-h-screen bg-background flex flex-col md:flex-row">
    <!-- Left Form Section -->
    <div class="flex-1 flex items-center justify-center px-6 py-10">
      <form class="w-full max-w-md space-y-5 bg-white p-6 rounded-lg">
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

        <div class="flex gap-4">
          <input
            type="text"
            placeholder="First Name"
            class="w-1/2 p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            class="w-1/2 p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white"
            required
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          class="w-full p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white"
          required
        />
        <input
          type="password"
          placeholder="Password"
          class="w-full p-3 rounded border border-gray-300 focus:ring focus:ring-blue-500 bg-white"
          required
        />

        <div class="flex items-start space-x-2 text-sm text-gray-600">
          <input type="checkbox" required class="mt-1" />
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
            Register
          </button>
        </div>

        <div class="text-center">
          <button
            @click="routeTo('/try')"
            class="w-[220px] py-2 rounded-lg border-2 border-black font-bold cursor-pointer bg-white text-black hover:bg-gray-200 text-base sm:text-lg md:text-xl transition-colors duration-300"
          >
            Continue as Guest
          </button>
        </div>

        <p class="text-center text-sm mt-4 text-black">
          Already have an account?
          <a @click="routeTo('/login')" class="text-primary cursor-pointer font-semibold hover:underline">Sign in</a>
        </p>
      </form>
    </div>

    <!-- Right Feature Section -->
    <Placeholder />
  </div>
</template>

<script setup>
import { useRouter } from '#vue-router';
import Placeholder from "~/components/login/Placeholder.vue";

const router = useRouter();
const routeTo = (route) => router.push(route);
</script>
