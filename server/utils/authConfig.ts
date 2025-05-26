import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

// Defaults for development/testing environments
const DEFAULT_JWT_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64-char hex fallback
const DEFAULT_SUPABASE_URL = 'http://localhost:54321'; // Fake URL, Supabase local dev often uses this port
const DEFAULT_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfIjoic2VydmljZV9yb2xlX2tleV9mYWtlX2RhdGEifQ.fake_signature_part_for_stub'; // Fake service role key

// Export sensitive keys via getter functions (lazy)
export function getJwtSecret() {
  const config = useRuntimeConfig();
  const jwtSecret = config.private.jwtSecret || DEFAULT_JWT_SECRET;

  if (!config.private.jwtSecret) {
    console.warn('[AuthConfig] WARNING: JWT_SECRET not found in environment variables. Using fallback. THIS IS INSECURE FOR PRODUCTION.');
  }

  return jwtSecret;
}

export function getSupabaseUrlForServiceRole() {
  const config = useRuntimeConfig();
  const url = config.private.supabaseUrlForServiceRole || DEFAULT_SUPABASE_URL;

  if (!config.private.supabaseUrlForServiceRole) {
    console.warn('[AuthConfig] WARNING: SUPABASE_URL_FOR_SERVICE_ROLE not found in environment variables. Using fallback.');
  }

  return url;
}

export function getSupabaseServiceRoleKey() {
  const config = useRuntimeConfig();
  const key = config.private.supabaseServiceRoleKey || DEFAULT_SUPABASE_SERVICE_KEY;

  if (!config.private.supabaseServiceRoleKey) {
    console.warn('[AuthConfig] WARNING: SUPABASE_SERVICE_ROLE_KEY not found in environment variables. Using fallback. THIS IS INSECURE FOR PRODUCTION.');
  }

  return key;
}

// Function to create a privileged Supabase client at runtime
export function getPrivilegedSupabaseClient(): SupabaseClient {
  const url = getSupabaseUrlForServiceRole();
  const key = getSupabaseServiceRoleKey();
  return createClient(url, key);
}

// Optional: A stub client for tests/development (unchanged)
export const privilegedSupabaseClientStub = {
  auth: {
    admin: {
      deleteUser: async (userId: string) => {
        console.log(`[STUB] privilegedSupabaseClient.auth.admin.deleteUser called for user ID: ${userId}`);
        return { data: { user: null }, error: null };
      },
    },
    signUp: async (credentials: { email?: string; password?: string; phone?: string; options?: any }) => {
      console.log(`[STUB] privilegedSupabaseClient.auth.signUp called for email: ${credentials.email}`);
      return {
        data: { user: { id: 'stubbed-supabase-user-id-' + Date.now(), email: credentials.email }, session: null },
        error: null
      };
    },
  },
  from: (table: string) => ({
    delete: () => ({
      eq: async (column: string, value: any) => {
        console.log(`[STUB] privilegedSupabaseClient.from('${table}').delete().eq('${column}', '${value}') called`);
        return { data: null, error: null };
      },
    }),
  }),
};
