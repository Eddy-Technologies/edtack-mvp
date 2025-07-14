<template>
  <div class="min-h-[300px] flex items-center justify-center">
    <div class="w-[360px] space-y-6 text-center">
      <div class="space-y-4">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
        <button
          class="w-full py-3 rounded-xl bg-[#c8e6ce] text-black font-semibold hover:bg-green-500 transition"
          @click="handleLogin"
        >
          Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const email = ref('');
const password = ref('');

const emit = defineEmits(['success']);

const handleLogin = () => {
  // Replace with actual auth logic here
  console.log('Logging in with', email.value, password.value);

  // Simulate login success
  emit('success');
};
</script>
