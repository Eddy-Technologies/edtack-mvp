<template>
  <div class="home">
    <header
        class="bg-white/75 dark:bg-gray-900/75 backdrop-blur border-b -mb-px sticky top-0 z-50 border-gray-200 dark:border-gray-800"
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
              class="text-xl md:text-2xl text-primary font-bold flex items-center gap-x-2"
              to="/store"
          >
            <UIcon
                name="i-heroicons-building-storefront-16-solid"
                class="flex-shrink-0 h-5 w-5 text-white-400 dark:text-white-500 ms-auto"
            />
          </ULink>
          <ColorMode />
        </div>
      </UContainer>
    </header>
    <main>
      <div class="flex items-center justify-center h-screen flex-col">
        <h1 class="title title-highlight text-center mb-6">
          Add Credits
        </h1>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ULink
              class="text-xl md:text-2xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-solid hover:border-primary hover:text-green-600 transition duration-300 ease-in-out w-64 h-16 px-6 py-3 rounded-lg p-2"
              @click="addCredits(10)"
          >
            $10
          </ULink>
          <ULink
              class="text-xl md:text-2xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-solid hover:border-primary hover:text-green-600 transition duration-300 ease-in-out w-64 h-16 px-6 py-3 rounded-lg p-2"
              @click="addCredits(50)"
          >
            $50
          </ULink>
          <ULink
              class="text-xl md:text-2xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-solid hover:border-primary hover:text-green-600 transition duration-300 ease-in-out w-64 h-16 px-6 py-3 rounded-lg p-2"
              @click="addCredits(100)"
          >
            $100
          </ULink>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { useCreditStore } from "~/stores/credit"; // Make sure to import the store correctly

// Use the store
const creditStore = useCreditStore();
const { showSuccessMessage } = useMessages()
// Function to add credits based on the amount
function addCredits(amount) {
  creditStore.count += amount;
  console.log("Add credits to child: ", amount);
  showSuccessMessage('Success Message', "Hello");
}
</script>

<style lang="scss" scoped>
</style>
