<template>
  <div class="flex items-center justify-center flex-col m-20">
    <h2 class="title text-primary">Add Credits</h2>
    <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
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
</template>

<script setup>
import { useCreditStore } from "~/stores/credit";
const toast = useToast()

// Use the store
const creditStore = useCreditStore();
// Function to add credits based on the amount
function addCredits(amount) {
  creditStore.count += amount;
  console.log("Add credits to child: ", amount);
  if (toast) {
    toast.add({
      title: 'Success',
      description: `You have added ${amount} credits.`,

      color: "green"
    });
  } else {
    console.warn('showSuccessMessage is not available');
  }
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 1.5rem;
}
</style>
