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
    '@nuxt/scripts',
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
  scripts: {
    registry: {
      googleAnalytics: {
        id: process.env.GOOGLE_TAG_MANAGER_ID,
      }
    }
  },
  devtools: { enabled: true },

  runtimeConfig: {
    private: {
      GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID,
      googleAIStudioApiKey: process.env.VITE_GOOGLE_AI_STUDIO_API_KEY
    },
  },
});