<template>
  <div class="flex items-center justify-center min-h-screen">
    <div v-if="!error">
      <p>Processing authentication...</p>
    </div>
    <div v-else>
      <p>Error: {{ error }}</p>
      <button @click="router.push('/login')">Return to Login</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '#imports';

const { exchangeCodeForSession } = useAuth();

// Adjust the import path as necessary
definePageMeta({
  layout: false
});

const router = useRouter();
const route = useRoute();
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    if (route.query.error) {
      error.value = 'Authentication failed';
      return;
    }
    // Extract authorization code from URL
    const code = route.query.code as string;
    if (!code) {
      error.value = 'No authorization code found';
      return;
    }
    const { onboardingCompleted } = await exchangeCodeForSession(code);
    if (!onboardingCompleted) {
      // If onboarding is not completed, redirect to the onboarding page
      router.push('/onboarding');
      return;
    }
    router.push('/dashboard');
  } catch (err: any) {
    error.value = 'Authentication error occurred';
    router.push('/login');
  }
});
</script>
