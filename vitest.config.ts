// vitest.config.ts
import { fileURLToPath } from 'node:url'; // Import for robust path creation
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    // vue(), // Uncomment this if you are testing Vue components (.vue files)
    // Note: Nuxt handles its own auto-imports for `unplugin-auto-import` and `unplugin-vue-components`.
    // You typically don't need to add them here unless for very specific non-Nuxt testing scenarios.
  ],
  test: {
    globals: true, // To use describe, it, expect, etc., globally
    environment: 'node', // For server-side API tests, 'node' is appropriate
    // For testing Vue components, you would typically use 'jsdom' or 'happy-dom'.
    // You can also set the environment per test file using a comment pragma.
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '~~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
      // If you need to test components or composables that rely on Nuxt's auto-imports
      // like '#app' or '#imports', resolving them in unit tests can be complex.
      // Often, you might mock these or use @nuxt/test-utils for a more integrated testing environment.
      // For example, to alias .nuxt directory:
      // '#build': fileURLToPath(new URL('./.nuxt/', import.meta.url)),
    },
    setupFiles: [
      './test/setup.ts', // Uncomment and create this file for global test setup
    ],
    // Optional: Add coverage configuration
    // coverage: {
    //   provider: 'v8', // or 'istanbul'
    //   reporter: ['text', 'json', 'html', 'lcov'],
    //   reportsDirectory: './coverage',
    //   include: ['server/**/*', 'components/**/*', 'composables/**/*', 'pages/**/*', 'plugins/**/*', 'utils/**/*'],
    //   exclude: ['**/*.d.ts', '.nuxt/**/*', 'node_modules/**/*'],
    // },
  },
});
