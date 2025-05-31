<template>
 <div>
 <NuxtRouteAnnouncer />
 <NuxtLoadingIndicator />
 <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-57GKW4FT" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
 <NuxtPage />
 <UNotifications />

 <!-- Feedback Components -->
 <FeedbackButton @openFeedback="openFeedbackModal" />
 <FeedbackModal :show="showFeedbackModal" @close="closeFeedbackModal" />
 <!-- End Feedback Components -->

 <!--
 <div v-if="!hasConsent" class="fixed bottom-0 left-0 w-full bg-gray-200 p-4 z-50 shadow-md">
 <div class="container mx-auto flex justify-between items-center">
 <p class="text-gray-700 text-sm">
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
// Import feedback components
import FeedbackButton from '~/components/common/FeedbackButton.vue';
import FeedbackModal from '~/components/common/FeedbackModal.vue';

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
 class: 'bg-gray-100',
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

// Reactive state for feedback modal visibility
const showFeedbackModal = ref(false);

function openFeedbackModal() {
 showFeedbackModal.value = true;
}

function closeFeedbackModal() {
 showFeedbackModal.value = false;
}
</script>

<style scoped>
</style>
