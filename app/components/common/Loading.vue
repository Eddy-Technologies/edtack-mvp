<template>
  <div
      :class="[
      'flex items-center justify-center',
      fullscreen
        ? 'fixed inset-0 bg-white/80 backdrop-blur z-50'
        : 'w-full h-full'
    ]"
  >
    <dotlottie-player
        :src="animationUrl"
        autoplay
        loop
        class="w-24 h-24 md:w-32 md:h-32"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
const props = defineProps<{
  animationUrl?: string
  fullscreen?: boolean
}>()

const animationUrl = computed(() =>
    props.animationUrl ??
    'https://lottie.host/1c4dc8c6-5417-4647-b1e4-4ef2f35233b0/R40bH3w1aC.json'
)
</script>
