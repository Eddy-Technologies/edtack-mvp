<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator />
  <NuxtPage />
  <UNotifications />
</template>

<script setup lang="ts">
useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
  bodyAttrs: {
    class: 'bg-gray-100 dark:bg-gray-900',
  },
  link: [
    { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
    {
      rel: 'icon',
      href: '/favicon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
    },
  ],
});

useSeoMeta({
  title: 'Eddy',
  ogTitle: 'Eddy - Education for All',
  description:
    'Eddy is an AI powered edtech platform that lets you and your child be motivated to learn together and earn rewards',
  ogImage: 'https://chat-github.nuxt.dev/home.png',
  twitterCard: 'summary_large_image',
});
</script>
