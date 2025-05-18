<template>
  <!-- Right Feature Section -->
  <div class="hidden md:flex flex-1 flex-col justify-center bg-[#0d1b2a] text-white p-10 space-y-6 rounded-l-lg">
    <div>
      <h2 class="font-semibold text-lg">Eddy</h2>
      <p class="text-sm">Education for All.</p>
    </div>
    <div>
      <h2 class="font-semibold text-lg">Powered by AI</h2>
      <p class="text-sm">Accelerate your education with targeted questions.</p>
    </div>
    <div>
      <h2 class="font-semibold text-lg">Parents Dashboard</h2>
      <p class="text-sm">Designed with parents in mind.</p>
    </div>
    <div class="mt-6 opacity-70 text-xs">
      Eddy 2025. All rights reserved.
    </div>
  </div>
</template>
<script>
import { ref } from 'vue';
import challenge from '../../../assets/home-mobile.png';

export default {
  setup() {
    const background = ref(challenge);

    return {
      background,
    };
  },
};
</script>
