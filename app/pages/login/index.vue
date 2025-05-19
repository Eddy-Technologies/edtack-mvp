<template>
  <div class="min-h-screen bg-background flex flex-col md:flex-row">
    <!-- Left Form Section -->
    <div class="flex-1 flex items-center justify-center px-6 py-10">
      <form class="w-full max-w-md space-y-5 bg-white p-6 rounded-lg">
        <!-- Back Icon -->
        <div class="top-4 left-4">
          <UIcon
            name="i-heroicons-arrow-left"
            class="icon cursor-pointer w-6 h-6 shrink-0 px-4"
            @click="routeTo('/')"
          />
        </div>
        <h1 class="text-2xl font-bold mb-6 text-center font-serif">Login to Eddy</h1>
        <input
            type="email"
            placeholder="Email"
            class="w-full p-3 border rounded border-gray-300 focus:ring focus:ring-blue-400 bg-white"
            required
        />
        <input
            type="password"
            placeholder="Password"
            class="w-full p-3 border rounded border-gray-300 focus:ring focus:ring-blue-400 bg-white"
            required
        />
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
          <a @click="routeTo('/register')" class="text-primary cursor-pointer font-semibold hover:underline">Sign up</a>
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
