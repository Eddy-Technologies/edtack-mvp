<template>
  <header
    class="bg-white/75 dark:bg-gray-900/75 backdrop-blur border-b -mb-px sticky top-0 z-50 border-gray-200 dark:border-gray-800"
  >
    <UContainer class="flex flex-wrap items-center justify-between h-14">
      <div class="flex items-center gap-x-4">
        <ULink
          class="text-xl md:text-2xl text-primary font-bold flex items-center gap-x-2"
          to="/"
        >
          <AppIcon class="w-8 h-8" /> EdAI
        </ULink>
      </div>
      <div class="flex items-center gap-x-4">
        <UIcon
            name="i-heroicons-currency-dollar-16-solid"
            class="flex-shrink-0 h-4 w-4 text-white-400 dark:text-white-500 ms-auto"
        />
        <span>0.00</span>
        <ColorMode />
      </div>
    </UContainer>
  </header>
</template>

<script setup lang="ts">
const { loggedIn } = useUserSession();

defineEmits(['clear']);

defineProps({

  hideClear: {
    type: Boolean,
    default: true,
  },
});
</script>
