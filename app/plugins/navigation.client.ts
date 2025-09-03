import { defineNuxtPlugin } from 'nuxt/app';

export default defineNuxtPlugin(() => {
  // Detect if this is external navigation (first load, refresh, or external link)
  const isExternal = !document.referrer ||
    !document.referrer.startsWith(window.location.origin) ||
    performance.getEntriesByType('navigation')[0]?.type !== 'reload';

  console.log('Navigation detection:', {
    isExternal,
    referrer: document.referrer,
    origin: window.location.origin
  });

  return {
    provide: {
      isExternalNavigation: isExternal
    }
  };
});
