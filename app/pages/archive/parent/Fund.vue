<template>
  <div>
    <!-- Linked Bank Account -->
    <div class="mt-10">
      <h3 class="text-lg font-extrabold text-primary mb-6">Linked Bank Account</h3>
      <ULink
        class="text-base md:text-lg text-primary font-bold flex items-center justify-center gap-2 border-2 border-primary hover:text-green-600 hover:border-green-600 transition duration-300 ease-in-out w-34 h-16 px-6 py-3 rounded-lg"
        @click="addBankAccount"
      >
        Link a Bank Account
      </ULink>
    </div>

    <!-- Quick Deposit -->
    <div class="mt-10 flex flex-col">
      <div class="flex items-center gap-4 mb-4">
        <h3 class="text-lg font-extrabold text-primary">Quick Deposit</h3>
        <select
          v-model="selectedChildIndex"
          class="border-2 border-primary rounded-lg text-primary p-2"
          @change="setSelectedChild"
        >
          <option disabled value="">Select a Child</option>
          <option v-for="(child, index) in children" :key="index" :value="index">
            {{ child.name }}
          </option>
        </select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-10 gap-4">
        <ULink
          v-for="amount in [10, 50, 100]"
          :key="amount"
          class="text-xl md:text-2xl text-primary font-bold flex items-center justify-center gap-2 border-2 border-primary hover:text-green-600 hover:border-green-600 transition duration-300 ease-in-out w-24 h-16 px-6 py-3 rounded-lg"
          @click="askForConfirmation(amount)"
        >
          ${{ amount }}
        </ULink>
      </div>
    </div>

    <!-- Deposit via PayNow -->
    <div class="mt-10 flex flex-col">
      <h3 class="text-lg font-extrabold text-primary mb-2">Deposit via PayNow</h3>
      <p class="mb-2 text-sm">
        Do not PayNow as we are in beta testing but if you want to support us, go ahead :)
      </p>
      <img class="w-40 m-2" :src="PayNow" alt="PayNow" />
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show-modal="showModal"
      :amount="creditAmount"
      :name="children[selectedChildIndex].name"
      @close="showModal = false"
      @confirm="addCreditsConfirmed"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import PayNow from '../../../../assets/paynow.png';
import { useCreditStore } from '~/stores/credit';
import { useProfileStore } from '~/stores/profile';
import ConfirmationModal from '~/components/ConfirmationModal.vue'; // Import the modal component

// Get the toast instance
const toast = useToast();

// Use the stores
const creditStore = useCreditStore();
const profileStore = useProfileStore();

// Initialize children data
const children = ref([{ name: 'John' }, { name: 'Jane' }, { name: 'Alice' }]);

// Reactive selected child index
const selectedChildIndex = ref(profileStore.childSelected); // Sync with profile store

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
  creditStore.addParentCredit(creditAmount.value); // Add credits to the parent account
  creditStore.addChildCredit(selectedChildIndex.value, creditAmount.value); // Add credit to the selected child

  showModal.value = false;
  if (toast) {
    toast.add({
      title: 'Success',
      description: `You have added ${creditAmount.value} credits.`,
      color: 'green',
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
    color: 'green',
  });
}
</script>

<style lang="scss" scoped></style>
