<template>
  <div
    :class="[
      'absolute top-0 left-0 w-full h-full z-50 flex items-center justify-center',
      fullscreen ? 'bg-white/80 backdrop-blur' : 'bg-white/30',
    ]"
  >
    <video autoplay muted loop playsinline class="w-32 h-32 md:w-40 md:h-40 object-contain">
      <source src="/loading.webm" type="video/webm" />
      Your browser does not support the video tag.
    </video>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  fullscreen?: boolean;
  transparent?: boolean;
}>();
</script>
