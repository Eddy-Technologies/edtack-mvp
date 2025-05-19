<template>
  <div class="flex bg-background justify-center items-center min-h-screen px-5 text-center overflow-hidden">
    <video
      class="w-full h-auto object-contain
             max-w-full max-h-[80vh]
             md:max-w-[80vw] md:max-h-[80vh]"
      autoplay
      muted
      loop
      playsinline
    >
      <source src="/../assets/eddy.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>
    <div class="flex flex-col items-center justify-center gap-4 mb-16 w-full">
      <button
          class="w-[220px] py-2 rounded-lg border-2 border-black font-bold cursor-pointer bg-white text-black hover:bg-gray-200 text-base sm:text-lg md:text-xl transition-colors duration-300"
          @click="routeTo('/try')"
      >
        Try Eddy Now
      </button>
      <button
          class="w-[220px] py-2 rounded-lg font-bold cursor-pointer bg-black text-white hover:bg-gray-800 text-base sm:text-lg md:text-xl transition-colors duration-300"
          @click="routeTo('/feedback')"
      >
        Write to Us
      </button>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from '#vue-router';

const router = useRouter();
const routeTo = (route) => router.push(route);
</script>
