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
      preference: 'light', // Default preference
      forced: true, // 💡 Force only light mode
      classSuffix: '', // Don't append `-dark` or `-light` to class
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
      title: 'Eddy - Your Learning Buddy',
      titleTemplate: '%s | Eddy',
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
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      stripeCustomerPortalUrl: process.env.NUXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL,
      chatWsUrl: process.env.NUXT_PUBLIC_CHAT_WS_URL || 'ws://localhost:8000',
      chatResponseTimeout: parseInt(process.env.NUXT_PUBLIC_CHAT_RESPONSE_TIMEOUT || '60000'),
    },
    private: {
      GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID,
      // For privileged client, ensure these are set in your deployment environment
      supabaseUrl: process.env.NUXT_PRIVATE_SUPABASE_URL,
      supabaseServiceRoleKey:
        process.env.NUXT_PRIVATE_SUPABASE_KEY || process.env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: process.env.JWT_SECRET,
      stripeSecretKey: process.env.NUXT_STRIPE_SECRET_KEY,
      stripeWebhookSecret: process.env.NUXT_STRIPE_WEBHOOK_SECRET,
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
