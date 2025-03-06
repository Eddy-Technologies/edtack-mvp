<template>
  <div class="bank-account-container mt-10">
    <h3 class="title text-primary">Linked Bank Account</h3>
    <ULink
        class="text-l md:text-l text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-solid hover:border-primary hover:text-green-600 transition duration-300 ease-in-out w-34 h-16 px-6 py-3 rounded-lg p-2"
        @click="addBankAccount"
    >
      Link a Bank Account
    </ULink>
  </div>

  <div class="quick-deposit-container flex flex-col mt-10">
    <div class="flex items-center gap-x-4">
      <h3 class="title text-primary">Quick Deposit</h3>
      <!-- Child Selection Dropdown -->
      <select v-model="selectedChildIndex" @change="setSelectedChild" class="quick-deposit-dropdown border-2 border-primary p-2 rounded-lg text-primary">
        <option disabled value="">Select a Child</option>
        <option v-for="(child, index) in children" :key="index" :value="index">
          {{ child.name }}
        </option>
      </select>
    </div>

    <!-- Quick Deposit Buttons -->
    <div class="grid grid-cols-1 md:grid-cols-10 gap-4">
      <ULink
          class="text-xl md:text-2xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-solid hover:border-primary hover:text-green-600 transition duration-300 ease-in-out w-24 h-16 px-6 py-3 rounded-lg p-2"
          @click="askForConfirmation(10)"
      >
        $10
      </ULink>
      <ULink
          class="text-xl md:text-2xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-solid hover:border-primary hover:text-green-600 transition duration-300 ease-in-out w-24 h-16 px-6 py-3 rounded-lg p-2"
          @click="askForConfirmation(50)"
      >
        $50
      </ULink>
      <ULink
          class="text-xl md:text-2xl text-primary font-bold flex items-center justify-center gap-x-2 border-2 border-solid hover:border-primary hover:text-green-600 transition duration-300 ease-in-out w-24 h-16 px-6 py-3 rounded-lg p-2"
          @click="askForConfirmation(100)"
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

  <!-- Confirmation Modal -->
  <ConfirmationModal
    :showModal="showModal"
    :amount="creditAmount"
    :name="children[selectedChildIndex].name"
    @close="showModal = false"
    @confirm="addCreditsConfirmed"
  />
</template>

<script setup>
import PayNow from '../../../assets/paynow.png';
import { useCreditStore } from "~/stores/credit";
import { useProfileStore } from "~/stores/profile";
import { ref, watch } from "vue";
import ConfirmationModal from "~/components/ConfirmationModal.vue";  // Import the modal component

// Get the toast instance
const toast = useToast();

// Use the stores
const creditStore = useCreditStore();
const profileStore = useProfileStore();

// Initialize children data
const children = ref([
  { name: "John"  },
  { name: "Jane"  },
  { name: "Alice" },
]);

// Reactive selected child index
const selectedChildIndex = ref(profileStore.childSelected);  // Sync with profile store

// Modal state
const showModal = ref(false);
const creditAmount = ref(0); // Holds the amount to be added when confirmed

// Function to trigger the add credits process
function askForConfirmation(amount) {
  creditAmount.value = amount;
  showModal.value = true;
}

// Function to add credits after confirmation
function addCreditsConfirmed() {
  creditStore.addParentCredit(creditAmount.value);  // Add credits to the parent account
  creditStore.addChildCredit(selectedChildIndex.value, creditAmount.value);  // Add credit to the selected child

  showModal.value = false;
  if (toast) {
    toast.add({
      title: 'Success',
      description: `You have added ${creditAmount.value} credits.`,
      color: "green"
    });
  }
}

// Method to handle the change of the child selection
const setSelectedChild = () => {
  if (selectedChildIndex.value !== null) {
    // Update the profile store's `childSelected` based on selected child
    profileStore.childSelected = selectedChildIndex.value;
  }
};

// Watch for changes in the selectedChildIndex and sync with the store
watch(selectedChildIndex, (newIndex) => {
  profileStore.childSelected = newIndex;
});

// Function to link a bank account
function addBankAccount() {
  toast.add({
    title: 'Success',
    description: 'You have linked a bank account.',
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

.quick-deposit-dropdown {
  margin-right: 10px;
  margin-bottom: 20px;
}
</style>
