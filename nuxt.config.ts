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
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
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
        indent: 2
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
      googleAIStudioApiKey: process.env.VITE_GOOGLE_AI_STUDIO_API_KEY,
      // For privileged client, ensure these are set in your deployment environment
      supabaseUrlForServiceRole: process.env.NUXT_PRIVATE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      supabaseServiceRoleKey: process.env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: process.env.JWT_SECRET,
    },
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY || process.env.VITE_SUPABASE_KEY,
    },
  },

  supabase: {
    // url and key can be omitted here if defined in runtimeConfig.public.supabaseUrl/Key
    // The @nuxtjs/supabase module will pick them up automatically.
    // url: process.env.VITE_SUPABASE_URL,
    // key: process.env.VITE_SUPABASE_KEY,
    redirect: false, // Set to true if you want to use the redirect URL for authentication
  },

  vite: {
    optimizeDeps: {
      include: [
        'ws',
      ],
    },
  },
});
