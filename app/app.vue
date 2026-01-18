<template>
  <div>
    <!-- Global App Loading Screen -->
    <AppLoadingScreen
      :show="showAppLoading"
      @after-leave="onLoadingComplete"
    />

    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />

    <!-- Feedback Button (only on xl+ screens where there's space outside chat) -->
    <FeedbackButton class="hidden xl:block" />

    <!-- Onboarding Tour Overlay -->
    <TourOverlay />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import AppLoadingScreen from '~/components/common/AppLoadingScreen.vue';
import FeedbackButton from '~/components/feedback/FeedbackButton.vue';
import TourOverlay from '~/components/tour/TourOverlay.vue';
import { useCodesStore } from '~/stores/codes';

// Loading state - always show initially, hide when stores are ready
const showAppLoading = ref(true);
const codesStore = useCodesStore();

const agreedToCookiesScriptConsent = useScriptTriggerConsent();
const hasConsent = ref(false);
const consentKey = 'analyticsConsentGiven';

useHead({
  script: [
    // Google Tag Manager (head)
    {
      innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
 new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
 j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
 })(window,document,'script','dataLayer','GTM-57GKW4FT');`,
      type: 'text/javascript',
    },
  ],
  noscript: [
    // Google Tag Manager (noscript fallback)
    {
      innerHTML: '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-57GKW4FT" height="0" width="0" style="display:none;visibility:hidden;"></iframe>',
      tagPosition: 'bodyOpen',
    },
  ],
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  bodyAttrs: {
    class: '',
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/logo.png', // relative to public/
    },
  ],
});

onMounted(async () => {
  const startTime = Date.now();
  const MIN_DISPLAY_TIME = 300; // milliseconds

  try {
    // Wait for codesStore to load (may already be loading via codes.client.ts plugin)
    if (!codesStore.isLoaded) {
      if (codesStore.isLoading) {
        // Plugin is loading codes, wait for it to complete
        await new Promise<void>((resolve) => {
          const unwatch = watch(
            () => codesStore.isLoaded,
            (isLoaded) => {
              if (isLoaded) {
                unwatch();
                resolve();
              }
            },
            { immediate: true }
          );
        });
      } else {
        // Not loading yet, start loading
        await codesStore.loadCodes();
      }
    }
  } catch (error) {
    console.error('Error during app initialization:', error);
    // Still hide loading screen to prevent stuck state
  }

  // Ensure minimum display time for smooth UX (prevent flash)
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);

  setTimeout(() => {
    showAppLoading.value = false;
  }, remaining);

  // Handle cookie consent
  const storedConsent = localStorage.getItem(consentKey);
  if (storedConsent) {
    hasConsent.value = true;
    agreedToCookiesScriptConsent.value = storedConsent === 'true';
  }
});

const onLoadingComplete = () => {
  // Any cleanup after loading animation completes
  console.log('App loading animation completed');
};
</script>

<style scoped></style>
