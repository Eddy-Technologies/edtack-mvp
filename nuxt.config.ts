// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-12-15',

  future: { compatibilityVersion: 4 },

  modules: [
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

  mdc: {
    remarkPlugins: {
      'remark-math': {
        src: 'remark-math',
        options: {
          singleDollarTextMath: true,
        },
      },
    },
    rehypePlugins: {
      'rehype-katex': {
        src: 'rehype-katex',
        options: {
          throwOnError: false,
          strict: false,
        },
      },
    },
  },

  ui: {
    colorMode: false
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
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css',
          crossorigin: 'anonymous',
        },
      ],
    },
  },
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripePricingTableId: process.env.NUXT_PUBLIC_STRIPE_PRICING_TABLE_ID,
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      stripeCustomerPortalUrl: process.env.NUXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL,
      chatResponseTimeout: parseInt(process.env.NUXT_PUBLIC_CHAT_RESPONSE_TIMEOUT || '60000'),
      chatWsUrl: process.env.NUXT_PUBLIC_CHAT_WS_URL,
      pythonApiUrl: process.env.NUXT_PUBLIC_PYTHON_API_URL,
      // Chat mode: 'websocket' or 'sse' - controls whether to use WebSocket or SSE+API for chat
      chatMode: process.env.NUXT_PUBLIC_CHAT_MODE || 'websocket',
      // Chat auth: whether the RAG backend requires authentication (matches AUTH_ENABLED on backend)
      // Default to true - only disable explicitly with 'false' for local dev without auth
      chatAuthEnabled: process.env.NUXT_PUBLIC_CHAT_AUTH_ENABLED !== 'false',
      // Feature flags - control feature availability per environment
      features: {
        subscriptionPlans: process.env.NUXT_PUBLIC_FEATURES_SUBSCRIPTION_PLANS === 'true',
        analytics: process.env.NUXT_PUBLIC_FEATURES_ANALYTICS !== 'false', // Default enabled
      },
    },
    private: {
      GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID,
      // For privileged client, ensure these are set in your deployment environment
      supabaseUrl: process.env.NUXT_PRIVATE_SUPABASE_URL,
      supabaseServiceRoleKey: process.env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: process.env.JWT_SECRET,
      stripeSecretKey: process.env.NUXT_STRIPE_SECRET_KEY,
      stripeWebhookSecret: process.env.NUXT_STRIPE_WEBHOOK_SECRET,
    },
  },

  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    serviceKey: process.env.NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY, // Add this
    redirect: false, // Set to true if you want to use the redirect URL for authentication
  },

  nitro: {
    preset: 'vercel',
  },

  vite: {
    optimizeDeps: {
      include: ['ws'],
    },
    resolve: {
      alias: {
        debug: 'debug/src/browser.js', // This is needed for MDC (markdown) to work in the browser
      },
    },
  },
});
