export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/') {
    let lastSlug = 'eddy';
    if (import.meta.client) {
      const stored = localStorage.getItem('lastActiveCharacterSlug');
      if (stored) lastSlug = stored;
    }
    return navigateTo(`/chat/${lastSlug}/new`, { replace: true });
  }
});
