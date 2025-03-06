import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useCreditStore = defineStore('credit', () => {
    const parentCredits = ref(0);  // This will hold the parent's credit
    const childCredits = ref([0 , 0 , 0]);  // This will hold an array of child credits
    const childEarnedCredits  = ref([0 , 0 , 0]);  // This will hold an array of child earned credits
    const name = ref('sfxcode');  // name value, as you had it earlier

    // Function to increment parent credits
    function addParentCredit(parentCredit) {
        parentCredits.value += parentCredit;
    }

    // Function to add child credit to the array
    function addChildCredit(childIndex, childCredit) {
        childCredits.value[childIndex] += childCredit;
        // Ensure Vue can track this update
        childCredits.value = [...childCredits.value];  // Trigger reactivity by resetting the array
    }

    // Watch the name and reset credits when it changes
    watch(name, () => {
        parentCredits.value = 0;
        childCredits.value = [0, 0, 0];  // Reset the array to default state
    });

    return { parentCredits, childCredits, childEarnedCredits, name, addParentCredit, addChildCredit };
});
