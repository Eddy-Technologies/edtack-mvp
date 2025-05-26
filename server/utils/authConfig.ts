import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

// Access runtime configuration
const config = useRuntimeConfig();

// Log the values to verify they are loaded during deployment
console.log('[AuthConfig] Initializing...');
console.log('[AuthConfig] JWT_SECRET available:', config.private.jwtSecret ? 'Yes (set)' : 'No (NOT SET)');
console.log('[AuthConfig] SUPABASE_URL_FOR_SERVICE_ROLE available:', config.private.supabaseUrlForServiceRole ? 'Yes (set)' : 'No (NOT SET)');
console.log('[AuthConfig] SUPABASE_SERVICE_ROLE_KEY available:', config.private.supabaseServiceRoleKey ? 'Yes (set)' : 'No (NOT SET)');
const DEFAULT_JWT_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // 64-char hex fallback
const DEFAULT_SUPABASE_URL = 'http://localhost:54321'; // Fake URL, Supabase local dev often uses this port
const DEFAULT_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfIjoic2VydmljZV9yb2xlX2tleV9mYWtlX2RhdGEifQ.fake_signature_part_for_stub'; // Fake service role key

console.log('[AuthConfig] Initializing configuration...');

// let jwtSecret = config.private.jwtSecret;
// if (!jwtSecret) {
//   console.warn('[AuthConfig] WARNING: JWT_SECRET not found in environment variables. Using default fallback. THIS IS INSECURE FOR PRODUCTION.');
// jwtSecret = DEFAULT_JWT_SECRET;
// }
const jwtSecret = DEFAULT_JWT_SECRET;

let supabaseUrlForServiceRole = config.private.supabaseUrlForServiceRole;
if (!supabaseUrlForServiceRole) {
  console.warn('[AuthConfig] WARNING: SUPABASE_URL_FOR_SERVICE_ROLE not found in environment variables. Using default fallback.');
  supabaseUrlForServiceRole = DEFAULT_SUPABASE_URL;
}

let supabaseServiceRoleKey = config.private.supabaseServiceRoleKey;
if (!supabaseServiceRoleKey) {
  console.warn('[AuthConfig] WARNING: SUPABASE_SERVICE_ROLE_KEY not found in environment variables. Using default fallback. THIS IS INSECURE FOR PRODUCTION.');
  supabaseServiceRoleKey = DEFAULT_SUPABASE_SERVICE_KEY;
}

// Export sensitive keys for use in other server files
export const JWT_SECRET = jwtSecret;
export const SUPABASE_URL_FOR_SERVICE_ROLE = supabaseUrlForServiceRole;
export const SUPABASE_SERVICE_ROLE_KEY = supabaseServiceRoleKey;

// Initialize and export a privileged Supabase client
// This client bypasses RLS and is used for administrative tasks like direct user creation/modification.
export const privilegedSupabaseClient: SupabaseClient = createClient(
  SUPABASE_URL_FOR_SERVICE_ROLE,
  SUPABASE_SERVICE_ROLE_KEY
);

export const privilegedSupabaseClientStub = {
  auth: {
    admin: {
      deleteUser: async (userId: string) => {
        console.log(`[STUB] privilegedSupabaseClient.auth.admin.deleteUser called for user ID: ${userId}`);
        // Simulate a successful deletion response
        return { data: { user: null }, error: null };
      },
    },
    signUp: async (credentials: { email?: string; password?: string; phone?: string; options?: any }) => {
      console.log(`[STUB] privilegedSupabaseClient.auth.signUp called for email: ${credentials.email}`);
      // Simulate a successful sign-up response, including a fake user ID
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
        // Simulate a successful deletion response
        return { data: null, error: null };
      },
    }),
  }),
};
