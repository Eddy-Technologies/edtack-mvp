<template>
  <div class="home">
    <AppHeader />
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
