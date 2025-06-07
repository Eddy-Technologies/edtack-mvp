<template>
  <div
    class="flex justify-center items-center min-h-screen bg-background px-5 text-center overflow-hidden"
  >
    <div class="flex flex-col items-center justify-center gap-8 w-full max-w-screen-lg">
      <!-- Video -->
      <video
        class="mx-auto w-full h-auto object-contain max-w-full max-h-[50vh] sm:max-h-[60vh] md:max-w-[80vw] md:max-h-[80vh]"
        autoplay
        muted
        loop
        playsinline
      >
        <source src="/../assets/eddy.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>

      <!-- Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mb-10">
        <button
          class="w-full sm:w-[220px] py-2 rounded-lg border-2 border-black font-bold cursor-pointer bg-white text-black hover:bg-gray-200 text-base sm:text-lg md:text-xl transition-colors duration-300"
          to="try"
        >
          Try Eddy Now
        </button>
        <button
          class="w-full sm:w-[220px] py-2 rounded-lg font-bold cursor-pointer bg-black text-white hover:bg-gray-800 text-base sm:text-lg md:text-xl transition-colors duration-300"
          to="feedback"
        >
          Write to Us
        </button>
      </div>
    </div>
  </div>
</template>

<script setup></script>
