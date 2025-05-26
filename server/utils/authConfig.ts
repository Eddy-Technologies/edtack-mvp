import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

// Access runtime configuration
const config = useRuntimeConfig();

// Log the values to verify they are loaded during deployment
console.log('[AuthConfig] Initializing...');
console.log('[AuthConfig] JWT_SECRET available:', config.private.jwtSecret ? 'Yes (set)' : 'No (NOT SET)');
console.log('[AuthConfig] SUPABASE_URL_FOR_SERVICE_ROLE available:', config.private.supabaseUrlForServiceRole ? 'Yes (set)' : 'No (NOT SET)');
console.log('[AuthConfig] SUPABASE_SERVICE_ROLE_KEY available:', config.private.supabaseServiceRoleKey ? 'Yes (set)' : 'No (NOT SET)');
console.log('[AuthConfig] Initializing configuration...');

// Export sensitive keys for use in other server files
export const JWT_SECRET = config.private.jwtSecret; ;
export const SUPABASE_URL_FOR_SERVICE_ROLE = config.private.supabaseUrlForServiceRole;
export const SUPABASE_SERVICE_ROLE_KEY = config.private.supabaseServiceRoleKey; ;

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
