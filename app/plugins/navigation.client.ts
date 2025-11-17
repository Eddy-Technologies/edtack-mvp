import { defineNuxtPlugin } from 'nuxt/app';

export default defineNuxtPlugin(() => {
  // Detect if this is external navigation (only from external links, not refreshes or back/forward)
  const navigationType = performance.getEntriesByType('navigation')[0]?.type;
  const isExternal = navigationType === 'navigate' && (
    !document.referrer ||
    !document.referrer.startsWith(window.location.origin)
  );

  console.log('Navigation detection:', {
    isExternal,
    navigationType,
    referrer: document.referrer,
    origin: window.location.origin
  });

  return {
    provide: {
      isExternalNavigation: isExternal
    }
  };
});
