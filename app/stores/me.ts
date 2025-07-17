import { defineStore } from 'pinia';
import { ref, computed } from 'vue'; // Or use `useState` if you need Nuxt's SSR shared state for *some* parts
import type { GetMeRes } from '~~/server/api/me.get';

export const useMeStore = defineStore('me', () => {
  const me = ref<GetMeRes | null>(null);
  const isLoading = ref(true);
  const error = ref<any | null>(null);

  // Action to fetch user data (as you had before)
  async function fetchMe() {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await $fetch<GetMeRes>('/api/me');
      me.value = data;
    } catch (e: any) {
      error.value = e;
      me.value = null;
      console.error('Error fetching me:', e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  // >>> THIS IS WHERE YOU DEFINE clearUser() <<<
  function clearMe() {
    me.value = null; // Set the user state back to null
    isLoading.value = false; // Reset loading state
    error.value = null; // Clear any previous errors
    console.log('Pinia user store has been cleared.');
  }
  // >>> END OF clearUser() DEFINITION <<<

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
