export default defineNuxtPlugin(async (nuxtApp) => {
  const codesStore = useCodesStore();

  try {
    // Load codes on app initialization
    // This ensures codes are available before any component needs them
    await codesStore.loadCodes();
  } catch (error) {
    console.error('Failed to load codes during app initialization:', error);

    // Don't prevent app from loading, but log the error
    // Components can handle missing codes gracefully
    nuxtApp.$toast?.error('Failed to load system codes. Some dropdowns may not work properly.');
  }
});
