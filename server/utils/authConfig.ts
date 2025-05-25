import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

// Access runtime configuration
const config = useRuntimeConfig();

// Log the values to verify they are loaded during deployment
console.log('[AuthConfig] Initializing...');
console.log('[AuthConfig] JWT_SECRET available:', config.private.jwtSecret ? 'Yes (set)' : 'No (NOT SET)');
console.log('[AuthConfig] SUPABASE_URL_FOR_SERVICE_ROLE available:', config.private.supabaseUrlForServiceRole ? 'Yes (set)' : 'No (NOT SET)');
console.log('[AuthConfig] SUPABASE_SERVICE_ROLE_KEY available:', config.private.supabaseServiceRoleKey ? 'Yes (set)' : 'No (NOT SET)');

// Export sensitive keys for use in other server files
export const JWT_SECRET = config.private.jwtSecret;
export const SUPABASE_URL_FOR_SERVICE_ROLE = config.private.supabaseUrlForServiceRole;
export const SUPABASE_SERVICE_ROLE_KEY = config.private.supabaseServiceRoleKey;

// Initialize and export a privileged Supabase client
// This client bypasses RLS and is used for administrative tasks like direct user creation/modification.
export const privilegedSupabaseClient: SupabaseClient = createClient(
  SUPABASE_URL_FOR_SERVICE_ROLE,
  SUPABASE_SERVICE_ROLE_KEY
);
