import { defineStore } from 'pinia';

export const useCreditStore = defineStore('credit', {
  // State is now a function that returns a plain object, do not use 'ref' or 'reactive' directly
  state: () => ({
    parentCredits: 0,
    childCredits: [0, 0, 0] as number[],
    childEarnedCredits: [0, 0, 0] as number[],
    name: 'sfxcode',
  }),

  actions: {
    // Function to increment parent credits
    addParentCredit(parentCredit: number) {
      this.parentCredits += parentCredit;
    },

    // Function to add child credit to the array
    addChildCredit(childIndex: number, childCredit: number) {
      // Direct modification of array element works fine with Pinia's reactivity
      this.childCredits[childIndex] += childCredit;
      // No need for `this.childCredits = [...this.childCredits]` here,
      // Pinia's reactivity handles array element updates.
    },

    resetCreditsOnNameChange() {
      this.parentCredits = 0;
      this.childCredits = [0, 0, 0];
      this.childEarnedCredits = [0, 0, 0];
    },
  },

  getters: {
    totalChildCredits: (state) => state.childCredits.reduce((sum, credit) => sum + credit, 0),
  },
});
