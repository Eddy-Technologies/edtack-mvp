// /test/setup.ts
import { vi } from 'vitest';

// Define the mocked runtime config in one place to ensure consistency
const mockedRuntimeConfig = {
  public: {
    apiBaseUrl: 'https://mock-api.example.com',
    featureFlags: {
      newFeatureX: true,
      anotherFeatureY: false,
    },
  },
  private: {
    GOOGLE_TAG_MANAGER_ID: 'GTM-MOCKID',
    googleAIStudioApiKey: 'mock-ai-studio-api-key',
    supabaseUrlForServiceRole: 'https://mock-supabase.example.co',
    supabaseServiceRoleKey: 'mock-supabase-service-role-key-string',
    jwtSecret: 'mock-super-secret-jwt-key-for-testing',
  },
};

vi.mock('nuxt/app', async (importOriginal) => {
  const actual = await importOriginal() as any; // Cast to any to access original exports
  return {
    ...actual, // Keep other nuxt/app exports
    // defineEventHandler will be handled by the h3 mock for clarity and directness
    useRuntimeConfig: () => mockedRuntimeConfig,
  };
});

// Mock h3 to provide defineEventHandler and other common utilities
vi.mock('h3', async (importOriginal) => {
  const actualH3 = await importOriginal() as any;

  const createErrorMock = (errInput: string | Record<string, any>) => {
    let statusCode = 500;
    let statusMessage = 'Internal Server Error';
    let data;

    if (typeof errInput === 'string') {
      statusMessage = errInput;
    } else if (typeof errInput === 'object' && errInput !== null) {
      statusCode = errInput.statusCode || statusCode;
      statusMessage = errInput.statusMessage || errInput.message || statusMessage;
      data = errInput.data;
    }

    const error = new Error(statusMessage);
    (error as any).statusCode = statusCode;
    (error as any).statusMessage = statusMessage;
    if (data !== undefined) {
      (error as any).data = data;
    }
    // H3's createError throws the error
    throw error;
  };

  return {
    ...actualH3, // Spread actual h3 exports first to allow overriding
    defineEventHandler: (handler: any) => handler,
    // Provide default mocks for other h3 utilities used by the handlers.
    // These can be overridden in specific tests if needed.
    readBody: vi.fn().mockResolvedValue({}),
    setCookie: vi.fn(),
    getCookie: vi.fn(),
    deleteCookie: vi.fn(),
    createError: createErrorMock,
    getHeader: vi.fn(),
    // Add any other h3 utilities your handlers might use directly
    // e.g., sendRedirect, sendError, isMethod, getQuery, etc.
  };
});

// Mock #supabase/server to provide the functions your authConfig.ts expects
vi.mock('#supabase/server', () => ({
  serverSupabaseClient: vi.fn().mockResolvedValue({
    // Provide a more complete mock Supabase client structure
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: {}, error: null }),
    // Add other Supabase client methods if used by getSupabaseClient directly
  }),
  serverSupabaseServiceRole: vi.fn().mockReturnValue({
    // Provide a more complete mock Supabase client structure for service role
    auth: {
      admin: {
        createUser: vi.fn().mockResolvedValue({ data: { user: { id: 'mock-admin-created-user-id' } }, error: null }),
        deleteUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: {}, error: null }),
  }),
}));

// Mock #imports to provide a basic structure for Nuxt's auto-imports
// This is often needed if files under test try to use auto-imported composables
vi.mock('#imports', () => ({
  // Provide the same mocked useRuntimeConfig here
  useRuntimeConfig: () => mockedRuntimeConfig,
  // Add other auto-imported items if your tests show they are missing from #imports
}));
