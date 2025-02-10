// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-30',

  future: { compatibilityVersion: 4 },

  modules: [
    '@nuxthub/core',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-auth-utils',
    '@nuxtjs/mdc',
    'nuxt-gtag',
  ],

  hub: {
    cache: true,
    database: true,
  },

  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
        semi: true,
        commaDangle: 'only-multiline',
        braceStyle: '1tbs',
        arrowParens: true,
      },
    },
  },

  devtools: { enabled: true },

  gtag: {
    id: process.env.GOOGLE_TAG_MANAGER_ID, // Set your GTM ID here
    enabled: process.env.NODE_ENV === 'production',
  },

  runtimeConfig: {
    public: {
      GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID,
    },
  },
});
