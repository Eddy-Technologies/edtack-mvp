<template>
  <div class="min-h-[300px] flex items-center justify-center">
    <div class="w-[360px] space-y-6 text-center">
      <div class="space-y-4">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        >
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        >
        <Button
          variant="primary"
          text="Sign Up"
          class="w-full py-3 rounded-xl font-semibold  transition"
          @click="handleRegister"
        >
          Register
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Button from '~/components/common/Button.vue';

const email = ref('');
const password = ref('');

const emit = defineEmits(['success']);

const handleRegister = () => {
  // Replace with actual auth logic here
  console.log('Logging in with', email.value, password.value);

  // Simulate login success
  emit('success');
};
</script>
