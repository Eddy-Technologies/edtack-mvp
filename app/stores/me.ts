import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useMe } from '~/composables/useUser';

export const useMeStore = defineStore('me', () => {
  const { data: me, isLoading, error, fetchMe } = useMe();

  function clearMe() {
    me.value = null; // Set the user state back to null
    isLoading.value = false; // Reset loading state
    error.value = null; // Clear any previous errors
    console.log('Pinia user store has been cleared.');
  }

  const isAuthenticated = computed(() => !!me.value);

  // const setMeIsLoading = (loadingState: boolean) => {
  //   isLoading.value = loadingState;
  // };

  return {
    me,
    meIsLoading: isLoading,
    error,
    fetchMe,
    clearMe, // Make sure to return it so it's accessible from components
    isAuthenticated,
    // setMeIsLoading
  };
});
