<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-57GKW4FT" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <NuxtPage />
    <UNotifications />
    <!--
    <div v-if="!hasConsent" class="fixed bottom-0 left-0 w-full bg-gray-200 dark:bg-gray-800 p-4 z-50 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <p class="text-gray-700 dark:text-gray-300 text-sm">
          This website uses cookies to enhance your experience. By continuing to use this site, you consent to our use of cookies.
          Do you consent to the use of analytics scripts?
        </p>
        <div>
          <button @click="giveConsent(true)" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
            Yes, I consent
          </button>
          <button @click="giveConsent(false)" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            No, thank you
          </button>
        </div>
      </div>
    </div>
    -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

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
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  bodyAttrs: {
    class: 'bg-gray-100 dark:bg-gray-900',
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/logo.png' // relative to public/
    }
  ]
});

useSeoMeta({
  title: 'Eddy',
  ogTitle: 'Eddy - Education for All',
  description:
      'Eddy is an AI powered edtech platform that lets you and your child be motivated to learn together and earn rewards',
  ogImage: '/logo.png',
  twitterCard: 'summary_large_image',
});

function giveConsent(agreed: boolean) {
  hasConsent.value = true;
  localStorage.setItem(consentKey, agreed.toString());
  agreedToCookiesScriptConsent.value = agreed;
}

onMounted(() => {
  const storedConsent = localStorage.getItem(consentKey);
  if (storedConsent) {
    hasConsent.value = true;
    agreedToCookiesScriptConsent.value = storedConsent === 'true';
  } else {
    // If no consent is stored, the consent form will be shown
  }
});

useScriptGoogleAnalytics({
  scriptOptions: {
    trigger: agreedToCookiesScriptConsent
  }
})
</script>

<style scoped>
.fixed {
  position: fixed;
}

.bottom-0 {
  bottom: 0;
}

.left-0 {
  left: 0;
}

.w-full {
  width: 100%;
}

.bg-gray-200 {
  background-color: #edf2f7;
}

.dark\:bg-gray-800 {
  @media (prefers-color-scheme: dark) {
    background-color: #2d3748;
  }
}

.p-4 {
  padding: 1rem;
}

.z-50 {
  z-index: 50;
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.container {
  max-width: 1280px;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.text-gray-700 {
  color: #4a5568;
}

.dark\:text-gray-300 {
  @media (prefers-color-scheme: dark) {
    color: #d1d5db;
  }
}

.text-sm {
  font-size: 0.875rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.bg-green-500 {
  background-color: #48bb78;
}

.hover\:bg-green-700:hover {
  background-color: #2f855a;
}

.text-white {
  color: #fff;
}

.font-bold {
  font-weight: 700;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.rounded {
  border-radius: 0.25rem;
}

.bg-red-500 {
  background-color: #f56565;
}

.hover\:bg-red-700:hover {
  background-color: #c53030;
}
</style>
