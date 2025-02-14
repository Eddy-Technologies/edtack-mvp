<template>
  <header
      class="bg-gray-200/75 dark:bg-gray-900/75 backdrop-blur border-b -mb-px sticky top-0 z-50 border-gray-200 dark:border-gray-800"
  >
    <UContainer class="flex flex-wrap items-center justify-between h-14">
      <div class="flex items-center gap-x-4">
        <ULink
            class="text-xl md:text-2xl text-primary font-bold flex items-center gap-x-2"
            to="/"
        >
          <AppIcon class="w-8 h-8" /> Eddy
        </ULink>
      </div>
      <div class="flex items-center gap-x-2">
        <UIcon
            name="i-heroicons-currency-dollar-16-solid"
            class="flex-shrink-0 h-5 w-5 text-white-400 dark:text-white-500 ms-auto"
        />
        <span>{{ credits }}</span>
        <ULink
            class="text-l md:text-xl text-primary flex items-center gap-x-2"
            to="/store"
        >
          STORE
        </ULink>
        <ColorMode />
      </div>
    </UContainer>
  </header>
</template>

<script>
import { ref, watch } from 'vue';
import { useCreditStore } from "~/stores/credit"; // Import your store

export default {
  setup() {
    const creditStore = useCreditStore();
    const credits = ref(creditStore.count);

    watch(
        () => creditStore.count, // Watch the credits value in the store
        (newCredits) => {
          credits.value = newCredits; // Update the local ref when the store's value changes
        }
    );

    return {
      credits
    };
  }
};
</script>
