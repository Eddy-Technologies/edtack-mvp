<template>
  <div class="bank-account-container mt-10">
    <h3 class="title text-primary">Linked Bank Account</h3>
    <ULink
        class="text-l md:text-l text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-solid hover:border-primary hover:text-green-600 transition duration-300 ease-in-out w-34 h-16 px-6 py-3 rounded-lg p-2"
        @click="addBankAccount()"
    >
      Link a Bank Account
    </ULink>
  </div>
  <div class="quick-deposit-container flex flex-col mt-10">
    <h3 class="title text-primary">Quick Deposit</h3>
    <div class="grid grid-cols-1 md:grid-cols-10 gap-4">
      <ULink
        class="text-xl md:text-2xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-solid hover:border-primary hover:text-green-600 transition duration-300 ease-in-out w-24 h-16 px-6 py-3 rounded-lg p-2"
        @click="addCredits(10)"
      >
        $10
      </ULink>
      <ULink
        class="text-xl md:text-2xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-solid hover:border-primary hover:text-green-600 transition duration-300 ease-in-out w-24 h-16 px-6 py-3 rounded-lg p-2"
        @click="addCredits(50)"
      >
        $50
      </ULink>
      <ULink
        class="text-xl md:text-2xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-solid hover:border-primary hover:text-green-600 transition duration-300 ease-in-out w-24 h-16 px-6 py-3 rounded-lg p-2"
        @click="addCredits(100)"
      >
        $100
      </ULink>
    </div>
  </div>
  <div class="quick-deposit-container flex flex-col mt-10">
    <h3 class="title text-primary">Deposit via PayNow</h3>
    <p>Do not PayNow as we are in beta testing but if you want to support us, go ahead :)</p>
    <img class="m-2 w-40" :src="PayNow" alt="PayNow">
  </div>
</template>

<script setup>
import PayNow from '../../../assets/paynow.png';
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

function addBankAccount() {
  console.log("Linked bank account");
  toast.add({
    title: 'Success',
    description: `You have linked a bank account.`,
    color: "green"
  });
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
}
</style>
