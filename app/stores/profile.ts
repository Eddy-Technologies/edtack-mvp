import { defineStore } from 'pinia';

export const useProfileStore = defineStore('profile', {
  // State is now a function that returns a plain object, do not use 'ref' or 'reactive' directly
  state: () => ({
    profile: '/' as string, // Initialize as a string, e.g., '/'
    childSelected: 0 as number, // Initialize as a number
    name: 'sfxcode' as string, // Initialize as a string
  }),

  // Actions are methods that modify the state
  actions: {
    setProfile(type: string) {
      this.profile = type;
    },

    setChild(selectedChildIndex: number) {
      // Renamed parameter for clarity
      this.childSelected = selectedChildIndex;
    },
  },

  getters: {
    currentProfilePath: (state) => `/profiles/${state.profile}`,
  },
});
