<template>
 <div class="credits-section border-gray-200">
 <h3>Credits</h3>
 <ul>
 <li>{{ credits }} Credits</li>
 </ul>
 <!-- Input for withdrawing credits -->
 <div class="withdraw-input">
 <label for="withdraw-amount">Withdraw Amount (in multiples of 10):</label>
 <input
 id="withdraw-amount"
 v-model="withdrawAmount"
 type="number"
 min="10"
 :max="credits"
 step="10"
 placeholder="Enter amount to withdraw"
 :disabled="credits === 0"
 @input="onInputChange"
 >
 </div>

 <button class="withdraw-button" @click="withdrawCredits">Withdraw</button>
 <button class="withdraw-all-button" @click="withdrawAllCredits">Withdraw All</button>
 </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCreditStore } from '~/stores/credit'; // Import your store

export default {
 setup() {
 const router = useRouter();
 const creditStore = useCreditStore();
 const credits = ref(creditStore.childCredits[0]);
 const withdrawAmount = ref(10); // Default withdraw amount is 10, as we only allow multiples of 10

 // Watch for changes in the credits value from the store
 watch(
 () => creditStore.childCredits,
 (newCredits) => {
 credits.value = newCredits; // Update local credits value
 }
 );

 // Method to handle input change to ensure it's a valid multiple of 10
 const onInputChange = () => {
 if (withdrawAmount.value % 10 !== 0) {
 withdrawAmount.value = Math.floor(withdrawAmount.value / 10) * 10; // Round to nearest multiple of 10
 }
 };

 // Method to withdraw credits (in multiples of 10)
 const withdrawCredits = () => {
 if (withdrawAmount.value % 10 === 0 && withdrawAmount.value <= credits.value && withdrawAmount.value > 0) {
 console.log('Withdrawing credits:', withdrawAmount.value);
 router.push({
 name: 'summary',
 query: {
 extraFee: 0,
 discount: 0,
 cart: JSON.stringify([]),
 withdrawalAmt: withdrawAmount.value
 }
 });
 // creditStore.count -= withdrawAmount.value;
 // credits.value -= withdrawAmount.value; // Update the credits locally as well
 } else {
 alert('Please enter a valid amount (multiple of 10) and ensure you have enough credits.');
 }
 };

 // Method to withdraw all credits
 const withdrawAllCredits = () => {
 if (credits.value > 0) {
 console.log('Withdrawing all credits:', credits.value);
 router.push({
 name: 'summary',
 query: {
 extraFee: 0,
 discount: 0,
 cart: JSON.stringify([]),
 withdrawalAmt: credits.value
 }
 });
 // creditStore.count = 0;
 // credits.value = 0; // Update the credits locally to 0
 } else {
 alert('No credits available to withdraw.');
 }
 };

 return {
 credits,
 withdrawAmount, // Bind the withdrawal input to this
 withdrawCredits,
 withdrawAllCredits,
 onInputChange
 };
 }
};
</script>

<style scoped>
.credits-section {
 padding: 15px;
 border: 1px solid #ddd; /* Default border */
 border-radius: 8px; /* Apply round corners */
}

h3 {
 margin-bottom: 10px;
 font-size: 18px;
}

ul {
 list-style-type: none;
 padding: 0;
}

li {
 font-size: 14px;
 color: #555;
}

.withdraw-input {
 margin-top: 10px;
}

.withdraw-input label {
 font-size: 14px;
 margin-right: 10px;
}

.withdraw-input input {
 padding: 5px;
 font-size: 14px;
 width: 100px;
 text-align: center;
}

.withdraw-button {
 font-size: 12px;
 margin-top: 10px;
 background-color: #3a80d2;
 color: white;
 padding: 10px;
 border: none;
 cursor: pointer;
}

.withdraw-all-button {
 margin-left: 10px;
 font-size: 12px;
 margin-top: 10px;
 background-color: #3a80d2;
 color: white;
 padding: 10px;
 border: none;
 cursor: pointer;
}

.withdraw-button:hover {
 background-color: #317bb5;
}

.withdraw-all-button:hover {
 background-color: #317bb5;
}
</style>
