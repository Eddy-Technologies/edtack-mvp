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

  ui: {
    colorMode: {
      preference: 'light',
      forcedValue: 'light',
    },
  },

  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
        semi: true,
        commaDangle: 'only-multiline',
        braceStyle: '1tbs',
        arrowParens: true,
        indent: 2,
      },
    },
  },
  scripts: {
    registry: {
      googleAnalytics: {
        id: process.env.GOOGLE_TAG_MANAGER_ID,
      },
    },
  },

  app: {
    head: {
      script: [
        {
          async: true,
          src: 'https://js.stripe.com/v3/pricing-table.js',
        },
      ],
    },
  },
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripePricingTableId: process.env.NUXT_PUBLIC_STRIPE_PRICING_TABLE_ID,
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL
    },
    private: {
      GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID,
      googleAIStudioApiKey: process.env.VITE_GOOGLE_AI_STUDIO_API_KEY,
      // For privileged client, ensure these are set in your deployment environment
      supabaseUrl: process.env.NUXT_PRIVATE_SUPABASE_URL,
      supabaseServiceRoleKey:
        process.env.NUXT_PRIVATE_SUPABASE_KEY || process.env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: process.env.JWT_SECRET,
      stripeSecretKey: process.env.NUXT_STRIPE_SECRET_KEY,
    },
  },

  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    redirect: false, // Set to true if you want to use the redirect URL for authentication
  },

  vite: {
    optimizeDeps: {
      include: ['ws'],
    },
  },
});
